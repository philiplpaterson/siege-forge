import random
from decimal import Decimal
from .db import get_session
from .models import Customer, Account, Transaction
from .seed_data import create_account_for
from .config import SIMULATOR_INTERVAL_SECONDS
from sqlalchemy import func
import time
from datetime import datetime


# small name lists for realistic random names
FIRST_NAMES = [
    "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas",
    "Henry", "Alexander", "Mason", "Michael", "Ethan", "Daniel", "Jacob", "Logan",
    "Jackson", "Levi", "Sebastian", "Mateo", "Jack", "Owen", "Theodore", "Aiden",
    "Samuel", "Joseph", "John", "David", "Wyatt", "Matthew", "Luke", "Asher",
    "Carter", "Julian", "Grayson", "Leo", "Jayden", "Gabriel", "Isaac", "Lincoln"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
]


def random_amount(min_cents=100, max_cents=10000):
    cents = random.randint(min_cents, max_cents)
    return Decimal(cents) / Decimal(100)


def create_random_account(session):
    # pick a realistic first + last name
    name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    opening = random_amount(5000, 20000)
    # generate a username from the name
    base_username = f"{name.split()[0].lower()}.{name.split()[-1].lower()}"
    # add a small random suffix to reduce collisions
    username = f"{base_username}{random.randint(1,999)}"
    # use the fixed test password for simulator-created users
    password = "password123"
    # generate realistic dummy sensitive fields
    email = f"{username}@example.com"
    phone = f"555-{random.randint(1000,9999):04d}"
    address = f"{random.randint(1,9999)} {random.choice(['Oak','Maple','Pine','Elm','Cedar'])} St, Testville"
    ssn = f"{random.randint(100,899):03d}-{random.randint(10,99):02d}-{random.randint(1000,9999):04d}"
    dob = f"{random.randint(1960,2000)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
    security_questions = {
        "mothers_maiden_name": random.choice(LAST_NAMES),
        "first_pet": random.choice(["Buddy","Rex","Whiskers","Goldie"]) ,
    }

    # reuse the create_account helper which records opening transaction
    cust, acct = create_account_for(
        session,
        name,
        opening,
        username=username,
        password=password,
        email=email,
        phone=phone,
        address=address,
        ssn=ssn,
        dob=dob,
        security_questions=security_questions,
    )
    print(f"{datetime.now().isoformat(sep=' ', timespec='seconds')} INFO Created account for {name} ({username}) with {opening}")


def deposit_random(session):
    acct = session.query(Account).order_by(func.random()).first()
    if not acct:
        print(f"{datetime.now().isoformat(sep=' ', timespec='seconds')} INFO No account available for deposit")
        return
    amt = random_amount(100, 2000)
    try:
        acct.deposit(session, amt, note="simulator deposit")
        print(f"{datetime.now().isoformat(sep=' ', timespec='seconds')} INFO Deposited {amt} to {acct.account_number}")
    except Exception as e:
        print(f"{datetime.now().isoformat(sep=' ', timespec='seconds')} ERROR Deposit failed: {e}")


def withdraw_random(session):
    acct = session.query(Account).order_by(func.random()).first()
    if not acct:
        print(f"{datetime.now().isoformat(sep=' ', timespec='seconds')} INFO No account available for withdrawal")
        return
    amt = random_amount(100, 2000)
    try:
        acct.withdraw(session, amt, note="simulator withdrawal")
        print(f"{datetime.now().isoformat(sep=' ', timespec='seconds')} INFO Withdrew {amt} from {acct.account_number}")
    except Exception as e:
        print(f"{datetime.now().isoformat(sep=' ', timespec='seconds')} ERROR Withdraw failed: {e}")


def perform_action():
    print(f"[simulator] performing action at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    s = get_session()
    try:
        actions = [create_random_account, deposit_random, withdraw_random]
        action = random.choice(actions)
        action(s)
    finally:
        s.close()


def start_scheduler():
    print("Simulator started — press Ctrl+C to stop")
    try:
        while True:
            perform_action()
            time.sleep(SIMULATOR_INTERVAL_SECONDS)
    except (KeyboardInterrupt, SystemExit):
        print("Simulator stopped")


if __name__ == '__main__':
    start_scheduler()
