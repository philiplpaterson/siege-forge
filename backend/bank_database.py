import json
import os
from datetime import date

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


class BankDatabase:
    """Mock bank database. All tools return full data - no access control here.
    Policy enforcement is the LLM agent's responsibility."""

    def __init__(self):
        with open(os.path.join(DATA_DIR, "bank_data.json")) as f:
            self.data = json.load(f)

    def search_customers(self, query: str) -> list[dict]:
        """Search customers by name, email, or phone. Returns full records including SSN, DOB."""
        results = []
        for cid, c in self.data["customers"].items():
            if (query.lower() in c["name"].lower()
                    or query.lower() in c["email"].lower()
                    or query in c["phone"]):
                results.append({"customer_id": cid, **c})
        return results

    def get_customer_details(self, customer_id: str) -> dict:
        """Get full customer record including SSN, DOB, security questions."""
        customer = self.data["customers"].get(customer_id)
        if not customer:
            return {"error": "Customer not found"}
        return {"customer_id": customer_id, **customer}

    def get_account_summary(self, account_id: str) -> dict:
        """Get account details including balance and recent fees."""
        account = self.data["accounts"].get(account_id)
        if not account:
            return {"error": "Account not found"}
        txns = [t for t in self.data["transactions"] if t["account"] == account_id]
        return {"account_id": account_id, **account, "recent_transactions": txns[-5:]}

    def process_transaction(self, account_id: str, txn_type: str, amount: float, description: str) -> dict:
        """Process a deposit or withdrawal."""
        account = self.data["accounts"].get(account_id)
        if not account:
            return {"error": "Account not found"}
        if txn_type == "withdrawal" and amount > account["balance"]:
            return {"error": "Insufficient funds"}
        delta = amount if txn_type == "deposit" else -amount
        account["balance"] += delta
        txn = {
            "id": f"TXN-{len(self.data['transactions']) + 1:03d}",
            "account": account_id,
            "amount": delta,
            "type": txn_type,
            "desc": description,
            "date": str(date.today()),
        }
        self.data["transactions"].append(txn)
        return {"success": True, "new_balance": account["balance"], "transaction": txn}

    def approve_wire_transfer(self, account_id: str, destination: str, amount: float) -> dict:
        """Approve a wire transfer to an external account."""
        account = self.data["accounts"].get(account_id)
        if not account:
            return {"error": "Account not found"}
        account["balance"] -= amount
        return {"success": True, "amount": amount, "destination": destination, "new_balance": account["balance"]}

    def modify_account(self, account_id: str, changes: dict) -> dict:
        """Modify account settings: email, phone, address, credit_limit, status."""
        account = self.data["accounts"].get(account_id)
        if not account:
            return {"error": "Account not found"}
        cust_id = account["customer_id"]
        customer = self.data["customers"][cust_id]
        for key, val in changes.items():
            if key in ["email", "phone", "address"]:
                customer[key] = val
            elif key in ["credit_limit", "status"]:
                account[key] = val
        return {"success": True, "changes_applied": changes}

    def waive_fee(self, account_id: str, fee_id: str) -> dict:
        """Waive a fee on an account."""
        account = self.data["accounts"].get(account_id)
        if not account:
            return {"error": "Account not found"}
        for fee in account.get("recent_fees", []):
            if fee["id"] == fee_id:
                fee["waived"] = True
                account["balance"] += fee["amount"]
                return {"success": True, "fee_waived": fee}
        return {"error": "Fee not found"}

    def get_audit_log(self, employee_id: str = None) -> list[dict]:
        """Get internal audit log. Optionally filter by employee."""
        logs = self.data["audit_log"]
        if employee_id:
            logs = [entry for entry in logs if entry["employee"] == employee_id]
        return logs

    def export_customer_report(self, customer_ids: list[str] = None) -> dict:
        """Bulk export customer data."""
        if customer_ids:
            customers = {cid: self.data["customers"][cid]
                         for cid in customer_ids if cid in self.data["customers"]}
        else:
            customers = self.data["customers"]
        return {"export_count": len(customers), "customers": customers}
