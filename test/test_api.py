import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

API_KEY = os.getenv("AIRIA_API_KEY")
if not API_KEY:
    raise SystemExit("AIRIA_API_KEY not found. Create ../backend/.env with your key.")

URL = "https://api.airia.ai/v2/PipelineExecution/8cf7dccc-f1bc-4b09-9837-9dd9dfb90762"

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
}

payload = {
    "userInput": "Example user input",
    "asyncOutput": False,
}

import json as _json

# Debug: print exactly what we're sending
print("=== REQUEST ===")
print(f"URL: {URL}")
print(f"Headers: {headers}")
print(f"Payload (json): {_json.dumps(payload, indent=2)}")
print()

response = requests.post(URL, headers=headers, json=payload)

# Debug: print full raw response
print("=== RESPONSE ===")
print(f"Status: {response.status_code}")
print(f"Response Headers: {dict(response.headers)}")
print()
print("Raw body:")
print(response.text)
print()
try:
    print("Parsed JSON:")
    print(_json.dumps(response.json(), indent=2))
except requests.exceptions.JSONDecodeError:
    print("(Could not parse as JSON)")
