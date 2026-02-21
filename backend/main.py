import logging
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json
import asyncio
import os

from bank_database import BankDatabase
from bank_agent import BankAgent
from hacker_agent import HackerAgent
from game_manager import GameManager

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("main")

# --- Load .env ---
_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    log.info("Loading .env from %s", _env_path)
    for line in _env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip()
        # Strip surrounding quotes
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            value = value[1:-1]
        if value and key not in os.environ:
            os.environ[key] = value
            log.info("  Loaded %s = %s...%s", key, value[:6], value[-4:])
else:
    log.warning("No .env file found at %s", _env_path)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

app = FastAPI(title="Red Team Banking Agent")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.get("/")
async def root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    log.info("WebSocket client connected")

    async def send_event(data: dict):
        await websocket.send_json(data)

    try:
        while True:
            msg = await websocket.receive_json()
            log.info("Received action: %s", msg.get("action"))

            if msg["action"] == "start_game":
                anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
                airia_api_key = os.environ.get("AIRIA_API_KEY", "")

                if not anthropic_key:
                    log.error("ANTHROPIC_API_KEY not set")
                    await send_event(
                        {"event": "error", "message": "ANTHROPIC_API_KEY not set in .env"}
                    )
                    continue
                if not airia_api_key:
                    log.error("AIRIA_API_KEY not set")
                    await send_event(
                        {"event": "error", "message": "AIRIA_API_KEY not set in .env"}
                    )
                    continue

                log.info("Initializing game — Anthropic key: %s..., Airia key: %s...",
                         anthropic_key[:10], airia_api_key[:10])

                db = BankDatabase()
                bank = BankAgent(anthropic_key, db)
                hacker = HackerAgent(airia_api_key)
                gm = GameManager(bank, hacker, db)
                gm.event_callback = send_event

                if "max_rounds" in msg:
                    gm.max_rounds = msg["max_rounds"]
                if "max_turns" in msg:
                    gm.max_turns_per_round = msg["max_turns"]
                    hacker.max_turns = msg["max_turns"]

                reset_policy_rules()
                log.info("Game config: %d rounds, %d turns/round",
                         gm.max_rounds, gm.max_turns_per_round)

                await send_event(
                    {
                        "event": "game_started",
                        "config": {
                            "max_rounds": gm.max_rounds,
                            "max_turns": gm.max_turns_per_round,
                            "employee": bank.employee,
                            "hacker_source": "Airia Pipeline",
                            "customers": [
                                {"id": cid, "name": c["name"]}
                                for cid, c in db.data["customers"].items()
                            ],
                            "accounts": [
                                {
                                    "id": aid,
                                    "type": a["type"],
                                    "customer_id": a["customer_id"],
                                    "balance": a["balance"],
                                }
                                for aid, a in db.data["accounts"].items()
                            ],
                        },
                    }
                )

                asyncio.create_task(gm.run_game())

    except WebSocketDisconnect:
        log.info("WebSocket client disconnected")
    except Exception as e:
        log.exception("WebSocket error: %s", e)


def reset_policy_rules():
    policy_path = os.path.join(DATA_DIR, "policy_rules.json")
    with open(policy_path) as f:
        rules = json.load(f)
    rules["security_incidents"] = []
    rules["version"] = 1
    with open(policy_path, "w") as f:
        json.dump(rules, f, indent=2)
    log.info("Policy rules reset to v1")
