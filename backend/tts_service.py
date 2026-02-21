import asyncio
import base64
import logging
import os

import aiohttp

log = logging.getLogger("tts_service")

ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

# Default ElevenLabs premade voice IDs
DEFAULT_VOICES = {
    "bankbot": "21m00Tcm4TlvDq8ikWAM",   # Rachel — professional, clear
    "hacker": "pNInz6obpgDQGcFmaJgB",     # Adam — casual male
    "judge": "ErXwobaYiN019PkySvjV",       # Antoni — authoritative
}


def get_voice_id(agent: str) -> str:
    env_key = f"ELEVENLABS_VOICE_{agent.upper()}"
    return os.environ.get(env_key, DEFAULT_VOICES.get(agent, DEFAULT_VOICES["bankbot"]))


async def generate_tts(text: str, agent: str) -> str | None:
    """Generate TTS audio for the given text and agent.

    Returns base64-encoded MP3 string, or None if TTS is unavailable.
    """
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        log.debug("ELEVENLABS_API_KEY not set — skipping TTS")
        return None

    voice_id = get_voice_id(agent)
    url = f"{ELEVENLABS_API_URL}/{voice_id}"

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_flash_v2_5",
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as resp:
                if resp.status != 200:
                    body = await resp.text()
                    log.warning("ElevenLabs API error %d: %s", resp.status, body[:200])
                    return None
                audio_bytes = await resp.read()
                return base64.b64encode(audio_bytes).decode("ascii")
    except Exception:
        log.exception("TTS generation failed for agent=%s", agent)
        return None
