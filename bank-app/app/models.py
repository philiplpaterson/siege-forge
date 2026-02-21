from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from decimal import Decimal, ROUND_DOWN
from .db import Base
from datetime import datetime


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False, index=True)
    username = Column(String(150), unique=True, nullable=True, index=True)
    password_hash = Column(String(200), nullable=True)
    email = Column(String(200), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(400), nullable=True)
    ssn = Column(String(20), nullable=True)
    dob = Column(String(20), nullable=True)
    security_questions = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    accounts = relationship("Account", back_populates="customer")


class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    account_number = Column(String(64), unique=True, nullable=False)
    balance = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    date_opened = Column(DateTime, default=func.now(), nullable=False)
    status = Column(String(32), default="active", nullable=False)

    customer = relationship("Customer", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", order_by="Transaction.timestamp")

    def _quantize(self, amount):
        if not isinstance(amount, Decimal):
            amount = Decimal(str(amount))
        return amount.quantize(Decimal("0.01"), rounding=ROUND_DOWN)

    def deposit(self, session, amount, note=None):
        amt = self._quantize(amount)
        self.balance = self._quantize(Decimal(self.balance) + amt)
        tx = Transaction(account_id=self.id, type="deposit", amount=amt, balance_after=self.balance, note=note)
        session.add(self)
        session.add(tx)
        session.commit()
        return tx

    def withdraw(self, session, amount, note=None):
        amt = self._quantize(amount)
        if Decimal(self.balance) < amt:
            raise ValueError("Insufficient funds")
        self.balance = self._quantize(Decimal(self.balance) - amt)
        tx = Transaction(account_id=self.id, type="withdrawal", amount=amt, balance_after=self.balance, note=note)
        session.add(self)
        session.add(tx)
        session.commit()
        return tx


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(String(32), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    balance_after = Column(Numeric(12, 2), nullable=False)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    note = Column(String(500), nullable=True)

    account = relationship("Account", back_populates="transactions")
