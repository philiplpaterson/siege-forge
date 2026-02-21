import json
import os
from datetime import date
import sys
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


class BankDatabase:
    """Adapter bank database. Preferentially uses `bank-app`'s SQLite DB via SQLAlchemy
    if available; otherwise falls back to the JSON file at `backend/data/bank_data.json`.

    The adapter exposes the same methods as the original JSON-backed class and
    keeps an in-memory `self.data` snapshot for compatibility with existing code.
    """

    def __init__(self):
        self.use_sql = False
        self.data = {}

        # Attempt to import the bank-app package by adding the sibling `bank-app` dir
        try:
            backend_root = os.path.dirname(__file__)
            bankapp_root = os.path.normpath(os.path.join(backend_root, "..", "bank-app"))
            if bankapp_root not in sys.path:
                sys.path.insert(0, bankapp_root)

            # import SQLAlchemy session and models from bank-app
            from app.db import get_session
            from app.models import Customer, Account, Transaction
            self._get_session = get_session
            self._Customer = Customer
            self._Account = Account
            self._Transaction = Transaction
            self.use_sql = True
        except Exception:
            # fallback to JSON
            self.use_sql = False

        if self.use_sql:
            self._sync_data_from_sql()
        else:
            with open(os.path.join(DATA_DIR, "bank_data.json")) as f:
                self.data = json.load(f)

    # ------------------------ SQL sync helpers ------------------------
    def _sync_data_from_sql(self):
        """Load current DB state into self.data snapshot."""
        s = self._get_session()
        try:
            customers = s.query(self._Customer).all()
            accounts = s.query(self._Account).all()
            txns = s.query(self._Transaction).order_by(self._Transaction.timestamp).all()

            cust_map = {}
            acct_map = {}

            for c in customers:
                cid = f"CUST-{c.id}"
                cust_map[cid] = {
                    "name": c.name,
                    "email": getattr(c, "email", None),
                    "phone": getattr(c, "phone", None),
                    "address": getattr(c, "address", None),
                    "ssn": getattr(c, "ssn", None),
                    "dob": getattr(c, "dob", None),
                    "security_questions": getattr(c, "security_questions", {}) or {},
                    "accounts": [],
                }

            for a in accounts:
                aid = f"ACC-{a.id}"
                acct_map[aid] = {
                    "customer_id": f"CUST-{a.customer_id}",
                    "type": getattr(a, "type", "checking") if hasattr(a, "type") else "checking",
                    "balance": float(a.balance),
                    "credit_limit": getattr(a, "credit_limit", None),
                    "status": a.status,
                    "recent_fees": getattr(a, "recent_fees", []) or [],
                }
                cid = f"CUST-{a.customer_id}"
                if cid in cust_map:
                    cust_map[cid]["accounts"].append(aid)

            tx_list = []
            for t in txns:
                tx_list.append({
                    "id": f"TXN-{t.id}",
                    "account": f"ACC-{t.account_id}",
                    "amount": float(t.amount),
                    "type": t.type,
                    "desc": t.note,
                    "date": t.timestamp.isoformat() if hasattr(t.timestamp, "isoformat") else str(t.timestamp),
                })

            self.data = {
                "customers": cust_map,
                "accounts": acct_map,
                "transactions": tx_list,
                "audit_log": [],
            }
        finally:
            s.close()

    def _writeback_snapshot(self):
        # best-effort refresh from SQL after mutations
        if self.use_sql:
            self._sync_data_from_sql()
        else:
            # persist JSON snapshot
            with open(os.path.join(DATA_DIR, "bank_data.json"), "w") as f:
                json.dump(self.data, f, indent=2)

    # ------------------------ Public API ------------------------
    def search_customers(self, query: str) -> list[dict]:
        results = []
        if self.use_sql:
            s = self._get_session()
            try:
                q = s.query(self._Customer)
                q = q.filter(self._Customer.name.ilike(f"%{query}%") | (self._Customer.email != None and self._Customer.email.ilike(f"%{query}%")))
                rows = q.limit(50).all()
                for c in rows:
                    cid = f"CUST-{c.id}"
                    results.append({"customer_id": cid,
                                    "name": c.name,
                                    "email": getattr(c, "email", None),
                                    "phone": getattr(c, "phone", None),
                                    "address": getattr(c, "address", None),
                                    })
            finally:
                s.close()
        else:
            for cid, c in self.data.get("customers", {}).items():
                if (query.lower() in c.get("name", "").lower() or
                        (c.get("email") and query.lower() in c.get("email", "").lower()) or
                        (c.get("phone") and query in c.get("phone", ""))):
                    results.append({"customer_id": cid, **c})
        return results

    def get_customer_details(self, customer_id: str) -> dict:
        if self.use_sql:
            try:
                cid = int(customer_id.split("-")[-1])
            except Exception:
                return {"error": "Customer not found"}
            s = self._get_session()
            try:
                c = s.query(self._Customer).get(cid)
                if not c:
                    return {"error": "Customer not found"}
                return {
                    "customer_id": f"CUST-{c.id}",
                    "name": c.name,
                    "email": getattr(c, "email", None),
                    "phone": getattr(c, "phone", None),
                    "address": getattr(c, "address", None),
                    "ssn": getattr(c, "ssn", None),
                    "dob": getattr(c, "dob", None),
                    "security_questions": getattr(c, "security_questions", {}) or {},
                }
            finally:
                s.close()
        else:
            customer = self.data.get("customers", {}).get(customer_id)
            if not customer:
                return {"error": "Customer not found"}
            return {"customer_id": customer_id, **customer}

    def get_account_summary(self, account_id: str) -> dict:
        if self.use_sql:
            try:
                aid = int(account_id.split("-")[-1])
            except Exception:
                return {"error": "Account not found"}
            s = self._get_session()
            try:
                a = s.query(self._Account).get(aid)
                if not a:
                    return {"error": "Account not found"}
                txns = s.query(self._Transaction).filter(self._Transaction.account_id == a.id).order_by(self._Transaction.timestamp.desc()).limit(5).all()
                return {"account_id": account_id,
                        "customer_id": f"CUST-{a.customer_id}",
                        "type": getattr(a, "type", "checking") if hasattr(a, "type") else "checking",
                        "balance": float(a.balance),
                        "recent_transactions": [{"id": f"TXN-{t.id}", "amount": float(t.amount), "type": t.type, "desc": t.note, "date": t.timestamp.isoformat() if hasattr(t.timestamp, "isoformat") else str(t.timestamp)} for t in txns]
                        }
            finally:
                s.close()
        else:
            account = self.data.get("accounts", {}).get(account_id)
            if not account:
                return {"error": "Account not found"}
            txns = [t for t in self.data.get("transactions", []) if t["account"] == account_id]
            return {"account_id": account_id, **account, "recent_transactions": txns[-5:]}

    def process_transaction(self, account_id: str, txn_type: str, amount: float, description: str) -> dict:
        if self.use_sql:
            try:
                aid = int(account_id.split("-")[-1])
            except Exception:
                return {"error": "Account not found"}
            s = self._get_session()
            try:
                a = s.query(self._Account).get(aid)
                if not a:
                    return {"error": "Account not found"}
                if txn_type == "withdrawal" and amount > float(a.balance):
                    return {"error": "Insufficient funds"}
                delta = amount if txn_type == "deposit" else -amount
                a.balance = float(a.balance) + delta
                tx = self._Transaction(account_id=a.id, type=txn_type, amount=delta, balance_after=a.balance, note=description)
                s.add(a)
                s.add(tx)
                s.commit()
                self._writeback_snapshot()
                return {"success": True, "new_balance": float(a.balance), "transaction": {"id": f"TXN-{tx.id}", "account": account_id, "amount": float(tx.amount), "type": tx.type, "desc": tx.note, "date": tx.timestamp.isoformat() if hasattr(tx.timestamp, "isoformat") else str(tx.timestamp)}}
            finally:
                s.close()
        else:
            account = self.data.get("accounts", {}).get(account_id)
            if not account:
                return {"error": "Account not found"}
            if txn_type == "withdrawal" and amount > account["balance"]:
                return {"error": "Insufficient funds"}
            delta = amount if txn_type == "deposit" else -amount
            account["balance"] += delta
            txn = {
                "id": f"TXN-{len(self.data.get('transactions', [])) + 1:03d}",
                "account": account_id,
                "amount": delta,
                "type": txn_type,
                "desc": description,
                "date": str(date.today()),
            }
            self.data.setdefault("transactions", []).append(txn)
            self._writeback_snapshot()
            return {"success": True, "new_balance": account["balance"], "transaction": txn}

    def approve_wire_transfer(self, account_id: str, destination: str, amount: float) -> dict:
        if self.use_sql:
            try:
                aid = int(account_id.split("-")[-1])
            except Exception:
                return {"error": "Account not found"}
            s = self._get_session()
            try:
                a = s.query(self._Account).get(aid)
                if not a:
                    return {"error": "Account not found"}
                a.balance = float(a.balance) - amount
                s.add(a)
                s.commit()
                self._writeback_snapshot()
                return {"success": True, "amount": amount, "destination": destination, "new_balance": float(a.balance)}
            finally:
                s.close()
        else:
            account = self.data.get("accounts", {}).get(account_id)
            if not account:
                return {"error": "Account not found"}
            account["balance"] -= amount
            self._writeback_snapshot()
            return {"success": True, "amount": amount, "destination": destination, "new_balance": account["balance"]}

    def modify_account(self, account_id: str, changes: dict) -> dict:
        if self.use_sql:
            try:
                aid = int(account_id.split("-")[-1])
            except Exception:
                return {"error": "Account not found"}
            s = self._get_session()
            try:
                a = s.query(self._Account).get(aid)
                if not a:
                    return {"error": "Account not found"}
                cust = s.query(self._Customer).get(a.customer_id)
                for key, val in changes.items():
                    if key in ["email", "phone", "address"] and cust is not None:
                        setattr(cust, key, val)
                    elif key in ["credit_limit", "status"]:
                        setattr(a, key, val)
                s.commit()
                self._writeback_snapshot()
                return {"success": True, "changes_applied": changes}
            finally:
                s.close()
        else:
            account = self.data.get("accounts", {}).get(account_id)
            if not account:
                return {"error": "Account not found"}
            cust_id = account["customer_id"]
            customer = self.data["customers"][cust_id]
            for key, val in changes.items():
                if key in ["email", "phone", "address"]:
                    customer[key] = val
                elif key in ["credit_limit", "status"]:
                    account[key] = val
            self._writeback_snapshot()
            return {"success": True, "changes_applied": changes}

    def waive_fee(self, account_id: str, fee_id: str) -> dict:
        if self.use_sql:
            # best-effort: fees stored as JSON on account; load, modify, save
            try:
                aid = int(account_id.split("-")[-1])
            except Exception:
                return {"error": "Account not found"}
            s = self._get_session()
            try:
                a = s.query(self._Account).get(aid)
                if not a:
                    return {"error": "Account not found"}
                fees = getattr(a, "recent_fees", []) or []
                for fee in fees:
                    if fee.get("id") == fee_id:
                        fee["waived"] = True
                        a.balance = float(a.balance) + fee.get("amount", 0)
                        setattr(a, "recent_fees", fees)
                        s.commit()
                        self._writeback_snapshot()
                        return {"success": True, "fee_waived": fee}
                return {"error": "Fee not found"}
            finally:
                s.close()
        else:
            account = self.data.get("accounts", {}).get(account_id)
            if not account:
                return {"error": "Account not found"}
            for fee in account.get("recent_fees", []):
                if fee["id"] == fee_id:
                    fee["waived"] = True
                    account["balance"] += fee["amount"]
                    self._writeback_snapshot()
                    return {"success": True, "fee_waived": fee}
            return {"error": "Fee not found"}

    def get_audit_log(self, employee_id: str = None) -> list[dict]:
        # backend does not currently store audit in SQL; return snapshot
        logs = self.data.get("audit_log", [])
        if employee_id:
            logs = [entry for entry in logs if entry.get("employee") == employee_id]
        return logs

    def export_customer_report(self, customer_ids: list[str] = None) -> dict:
        if self.use_sql:
            s = self._get_session()
            try:
                if customer_ids:
                    cust_ids = [int(cid.split("-")[-1]) for cid in customer_ids]
                    rows = s.query(self._Customer).filter(self._Customer.id.in_(cust_ids)).all()
                else:
                    rows = s.query(self._Customer).all()
                customers = {f"CUST-{r.id}": {"name": r.name, "email": getattr(r, "email", None), "phone": getattr(r, "phone", None)} for r in rows}
                return {"export_count": len(customers), "customers": customers}
            finally:
                s.close()
        else:
            if customer_ids:
                customers = {cid: self.data["customers"][cid]
                             for cid in customer_ids if cid in self.data["customers"]}
            else:
                customers = self.data["customers"]
            return {"export_count": len(customers), "customers": customers}

    def _next_customer_id(self) -> str:
        existing = [int(k.split("-")[-1]) for k in self.data.get("customers", {}).keys() if k.startswith("CUST-")]
        next_id = max(existing) + 1 if existing else 1001
        return f"CUST-{next_id}"

    def _next_account_id(self) -> str:
        existing = [int(k.split("-")[-1]) for k in self.data.get("accounts", {}).keys() if k.startswith("ACC-")]
        next_id = max(existing) + 1 if existing else 4001
        return f"ACC-{next_id}"

    def create_customer_and_account(self, name: str, opening_amount: float, username: Optional[str] = None) -> dict:
        if self.use_sql:
            # use bank-app seed helper to create account so fields and txns are consistent
            try:
                from app.seed_data import create_account_for
            except Exception:
                create_account_for = None
            s = self._get_session()
            try:
                if create_account_for:
                    cust, acct = create_account_for(s, name, opening_amount, username=username)
                    s.expunge_all()
                    self._writeback_snapshot()
                    return {"customer_id": f"CUST-{cust.id}", "account_id": f"ACC-{acct.id}", "transaction": {"id": f"TXN-{acct.transactions[0].id}" if acct.transactions else None}}
                # fallback: create minimal records directly
                c = self._Customer(name=name, username=username)
                s.add(c)
                s.flush()
                a = self._Account(customer_id=c.id, account_number=f"{os.urandom(8).hex()}", balance=opening_amount)
                s.add(a)
                s.flush()
                t = self._Transaction(account_id=a.id, type="open", amount=opening_amount, balance_after=opening_amount, note="opening deposit")
                s.add(t)
                s.commit()
                self._writeback_snapshot()
                return {"customer_id": f"CUST-{c.id}", "account_id": f"ACC-{a.id}", "transaction": {"id": f"TXN-{t.id}"}}
            finally:
                s.close()
        else:
            cust_id = self._next_customer_id()
            acct_id = self._next_account_id()

            customer = {
                "name": name,
                "email": None,
                "phone": None,
                "address": None,
                "ssn": None,
                "dob": None,
                "security_questions": {},
                "accounts": [acct_id],
            }

            account = {
                "customer_id": cust_id,
                "type": "checking",
                "balance": float(opening_amount),
                "credit_limit": None,
                "status": "active",
                "recent_fees": [],
            }

            self.data.setdefault("customers", {})[cust_id] = customer
            self.data.setdefault("accounts", {})[acct_id] = account

            txn = {
                "id": f"TXN-{len(self.data.get('transactions', [])) + 1:03d}",
                "account": acct_id,
                "amount": float(opening_amount),
                "type": "open",
                "desc": "opening deposit",
                "date": str(date.today()),
            }
            self.data.setdefault("transactions", []).append(txn)
            self._writeback_snapshot()
            return {"customer_id": cust_id, "account_id": acct_id, "transaction": txn}
