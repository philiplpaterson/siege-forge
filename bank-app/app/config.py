import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///bank.db")
# default simulator interval shortened for testing; override in .env
SIMULATOR_INTERVAL_SECONDS = int(os.getenv("SIMULATOR_INTERVAL_SECONDS", "5"))
APP_SECRET = os.getenv("APP_SECRET", "change-me")
