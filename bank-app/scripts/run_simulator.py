import sys
from pathlib import Path

# Ensure the package root (bank-app) is on sys.path so `import app` works
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.simulator import start_scheduler


if __name__ == '__main__':
    start_scheduler()
