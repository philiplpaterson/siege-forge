This backend uses the JSON-based `backend/data/bank_data.json` mock database for the Red Team Banking demo.

Simulation
 - For a live simulator that creates accounts and performs deposits/withdrawals, use the `bank-app` simulator which targets the SQLAlchemy-based `bank-app/bank.db`.
 - Run the bank-app simulator from the project root:

```bash
python bank-app/scripts/run_simulator.py
```

Notes
 - The `backend` and `bank-app` simulators served similar purposes; the project is configured to use the `bank-app` simulator as the canonical simulator.
 - If you later want to make the `backend` use the `bank-app` DB as a single source-of-truth, we can add an adapter to `backend/bank_database.py`.

