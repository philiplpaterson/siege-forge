# Mock Bank App

Lightweight mock banking app (SQLite + SQLAlchemy) with a transaction simulator.

Quick start

1. Install dependencies

```bash
python -m pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and adjust if needed.

3. Initialize DB and seed data:

```bash
python -m app.init_db
python -m app.seed_data
```

4. Run simulator (foreground):

```bash
python scripts/run_simulator.py
```

5. If you want to restart the environment:

```bash
python scripts/reset_db.py
```

Files of interest
- `app/models.py` — ORM models and business logic
- `app/simulator.py` — periodic transaction generator
- `scripts/create_account.py` — CLI helper
