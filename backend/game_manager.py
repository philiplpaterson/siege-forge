import asyncio
import json
import logging
import os

from .bank_agent import BankAgent
from .hacker_agent import HackerAgent
from .bank_database import BankDatabase

log = logging.getLogger("game_manager")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


class GameManager:
    def __init__(
        self,
        bank_agent: BankAgent,
        hacker_agent: HackerAgent,
        db: BankDatabase,
    ):
        self.bank_agent = bank_agent
        self.hacker_agent = hacker_agent
        self.db = db
        self.max_rounds = 4
        self.max_turns_per_round = 8
        self.current_round = 0
        self.current_turn = 0
        self.round_results: list = []
        self.is_running = False
        self.event_callback = None

    async def run_game(self):
        log.info("=== GAME STARTING — %d rounds, %d turns/round ===",
                 self.max_rounds, self.max_turns_per_round)
        self.is_running = True
        original_data = json.loads(json.dumps(self.db.data))

        for round_num in range(1, self.max_rounds + 1):
            self.current_round = round_num
            self.current_turn = 0
            self.bank_agent.reset()
            self.hacker_agent.reset_round()
            self.hacker_agent.current_round = round_num
            self.db.data = json.loads(json.dumps(original_data))

            log.info("--- Round %d/%d starting ---", round_num, self.max_rounds)
            await self.emit(
                "round_start",
                {"round": round_num, "max_rounds": self.max_rounds},
            )

            bankbot_response = None
            judge_verdict = None

            for turn in range(1, self.max_turns_per_round + 1):
                self.current_turn = turn
                log.info("  Turn %d/%d", turn, self.max_turns_per_round)

                # 1. Call Airia pipeline (returns hacker message OR judge verdict)
                try:
                    airia_result = await self.hacker_agent.call_pipeline(
                        bankbot_response
                    )
                except Exception as e:
                    log.exception("Airia pipeline failed on round %d turn %d", round_num, turn)
                    await self.emit(
                        "error", {"message": f"Airia API error: {str(e)}"}
                    )
                    break

                # 2. Check if the judge ended the round
                if airia_result["agent"] == "judge":
                    log.warning("JUDGE VERDICT on round %d turn %d", round_num, turn)
                    judge_verdict = airia_result["message"]
                    await self.emit(
                        "judge_verdict",
                        {
                            "round": round_num,
                            "turn": turn,
                            "analysis": judge_verdict,
                        },
                    )
                    break

                # 3. It's a hacker message — show it
                hacker_msg = airia_result["message"]
                await self.emit(
                    "hacker_message",
                    {"round": round_num, "turn": turn, "message": hacker_msg},
                )
                await asyncio.sleep(0.5)

                # 4. BankBot responds (local Claude with tool use)
                try:
                    bankbot_response, tools_used = await self.bank_agent.respond(
                        hacker_msg
                    )
                except Exception as e:
                    log.exception("BankBot failed on round %d turn %d", round_num, turn)
                    await self.emit(
                        "error", {"message": f"BankBot error: {str(e)}"}
                    )
                    break

                for tool_call in tools_used:
                    await self.emit(
                        "tool_call",
                        {
                            "round": round_num,
                            "turn": turn,
                            "tool": tool_call["tool"],
                            "input": tool_call["input"],
                            "output": tool_call["output"],
                        },
                    )

                await self.emit(
                    "bank_message",
                    {
                        "round": round_num,
                        "turn": turn,
                        "message": bankbot_response,
                        "tools_used": [t["tool"] for t in tools_used],
                    },
                )
                await asyncio.sleep(0.5)

            # Build round result
            breached = judge_verdict is not None
            result = {
                "round": round_num,
                "turns_used": self.current_turn,
                "leaked": breached,
                "summary": (
                    judge_verdict if breached else "BankBot successfully defended."
                ),
            }
            self.round_results.append(result)
            self.hacker_agent.previous_results.append(result)
            log.info("Round %d result: %s (%d turns)",
                     round_num, "BREACHED" if breached else "DEFENDED",
                     result["turns_used"])
            await self.emit("round_end", result)

            if breached:
                self.update_policy_after_breach(round_num, judge_verdict)

        await self.emit(
            "game_over",
            {
                "results": self.round_results,
                "total_rounds": self.max_rounds,
                "breaches": sum(1 for r in self.round_results if r["leaked"]),
            },
        )
        self.is_running = False
        breaches = sum(1 for r in self.round_results if r["leaked"])
        log.info("=== GAME OVER — %d/%d rounds breached ===", breaches, self.max_rounds)

    def update_policy_after_breach(self, round_num: int, judge_analysis: str):
        policy_path = os.path.join(DATA_DIR, "policy_rules.json")
        with open(policy_path) as f:
            rules = json.load(f)
        rules["security_incidents"].append(
            {
                "round": round_num,
                "summary": judge_analysis[:300],
            }
        )
        rules["version"] += 1
        with open(policy_path, "w") as f:
            json.dump(rules, f, indent=2)
        log.info("Policy rules updated to v%d after round %d breach",
                 rules["version"], round_num)

    async def emit(self, event_type: str, data: dict):
        if self.event_callback:
            await self.event_callback({"event": event_type, **data})
