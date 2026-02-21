import argparse
import os
import sys
# ensure project root is on sys.path when running this script directly
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.db import get_session
from app.models import Transaction, Account, Customer
from app.config import DATABASE_URL


def is_sqlite(url: str):
    return url.startswith("sqlite:///")


def sqlite_path(url: str):
    # sqlite:///relative-or-absolute-path
    return url.replace("sqlite:///", "", 1)


def reset_db(confirm: bool, drop_file: bool):
    if not confirm:
        ans = input("This will DELETE ALL accounts, transactions and customers. Type YES to continue: ")
        if ans.strip() != "YES":
            print("Aborted")
            return

    s = get_session()
    try:
        tx_count = s.query(Transaction).count()
        acct_count = s.query(Account).count()
        cust_count = s.query(Customer).count()
        print(f"Deleting {tx_count} transactions, {acct_count} accounts, {cust_count} customers...")

        # delete in order to respect FK constraints
        s.query(Transaction).delete()
        s.query(Account).delete()
        s.query(Customer).delete()
        s.commit()
        print("All records deleted.")
    finally:
        s.close()

    if drop_file and is_sqlite(DATABASE_URL):
        dbfile = sqlite_path(DATABASE_URL)
        if os.path.exists(dbfile):
            os.remove(dbfile)
            print(f"Removed sqlite DB file: {dbfile}")
        else:
            print(f"SQLite DB file not found: {dbfile}")


def main():
    p = argparse.ArgumentParser(description="Reset the mock bank database (destructive)")
    p.add_argument("--yes", "-y", action="store_true", help="Skip confirmation prompt")
    p.add_argument("--drop-file", action="store_true", help="Also delete the sqlite DB file if used")
    args = p.parse_args()
    reset_db(confirm=args.yes, drop_file=args.drop_file)


if __name__ == '__main__':
    main()
