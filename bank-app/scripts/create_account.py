import argparse
from app.db import get_session
from app.seed_data import create_account_for


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--name', required=True)
    p.add_argument('--amount', type=float, default=0)
    p.add_argument('--username', required=False)
    p.add_argument('--password', required=False)
    args = p.parse_args()
    s = get_session()
    try:
        cust, acct = create_account_for(s, args.name, args.amount, username=args.username, password=args.password)
        print(f"Created account {acct.account_number} for {cust.name} with {acct.balance}")
        if args.username:
            print(f"Created user: {args.username}")
    finally:
        s.close()


if __name__ == '__main__':
    main()
