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

    async def send_event(data: dict):
        await websocket.send_json(data)

    try:
        while True:
            msg = await websocket.receive_json()

            if msg["action"] == "start_game":
                anthropic_key = msg.get(
                    "anthropic_api_key", os.environ.get("ANTHROPIC_API_KEY", "")
                )
                airia_api_key = msg.get(
                    "airia_api_key", os.environ.get("AIRIA_API_KEY", "")
                )
                airia_pipeline_id = msg.get(
                    "airia_pipeline_id", os.environ.get("AIRIA_PIPELINE_ID", "")
                )

                if not anthropic_key:
                    await send_event(
                        {"event": "error", "message": "No Anthropic API key provided"}
                    )
                    continue
                if not airia_api_key or not airia_pipeline_id:
                    await send_event(
                        {
                            "event": "error",
                            "message": "No Airia API key or pipeline ID provided",
                        }
                    )
                    continue

                db = BankDatabase()
                bank = BankAgent(anthropic_key, db)
                hacker = HackerAgent(airia_api_key, airia_pipeline_id)
                gm = GameManager(bank, hacker, db)
                gm.event_callback = send_event

                if "max_rounds" in msg:
                    gm.max_rounds = msg["max_rounds"]
                if "max_turns" in msg:
                    gm.max_turns_per_round = msg["max_turns"]
                    hacker.max_turns = msg["max_turns"]

                reset_policy_rules()

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
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")


def reset_policy_rules():
    policy_path = os.path.join(DATA_DIR, "policy_rules.json")
    with open(policy_path) as f:
        rules = json.load(f)
    rules["security_incidents"] = []
    rules["version"] = 1
    with open(policy_path, "w") as f:
        json.dump(rules, f, indent=2)
