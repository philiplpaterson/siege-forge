from .db import get_session
from .models import Customer, Account, Transaction
from .security import hash_password
from datetime import datetime
import secrets


def create_account_for(session, name, opening_amount, username=None, password=None,
                       email=None, phone=None, address=None, ssn=None, dob=None,
                       security_questions=None):
    if security_questions is None:
        security_questions = {}

    customer = Customer(
        name=name,
        username=username,
        email=email,
        phone=phone,
        address=address,
        ssn=ssn,
        dob=dob,
        security_questions=security_questions,
    )
    if password:
        customer.password_hash = hash_password(password)
    session.add(customer)
    session.flush()
    acct = Account(
        customer_id=customer.id,
        account_number=secrets.token_hex(8),
        balance=opening_amount,
    )
    session.add(acct)
    session.flush()
    # record opening transaction
    tx = Transaction(account_id=acct.id, type="open", amount=opening_amount, balance_after=opening_amount, note="opening deposit")
    session.add(tx)
    session.commit()
    return customer, acct


def seed():
    s = get_session()
    try:
        # create Ian with $3000 and credentials if not exists
        existing = s.query(Customer).filter(Customer.name == "Ian").first()
        if existing:
            print("Ian already exists — skipping seed")
            return
        cust, acct = create_account_for(
            s,
            "Ian",
            3000,
            username="ian",
            password="password123",
            email="ian@example.com",
            phone="555-1000",
            address="1 Test St, Testville",
            ssn="123-45-6789",
            dob="1985-03-15",
            security_questions={"mothers_maiden_name": "Williams", "first_pet": "Buddy"},
        )
        print(
            "Seeded Ian with $3000; username=ian password=password123 (change immediately)"
        )
    finally:
        s.close()


if __name__ == "__main__":
    seed()
