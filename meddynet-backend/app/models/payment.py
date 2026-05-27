import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"
    failed = "failed"


class LedgerType(str, enum.Enum):
    credit = "credit"
    debit = "debit"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(
        UUID(as_uuid=True), ForeignKey("bookings.id"), unique=True, nullable=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"))

    razorpay_order_id = Column(String(100), unique=True, nullable=False)
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)

    total_amount = Column(Integer, nullable=False)
    commission_amount = Column(Integer, nullable=False)
    lab_amount = Column(Integer, nullable=False)

    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    refund_id = Column(String(100), nullable=True)

    is_transferred = Column(
        DateTime(timezone=True), nullable=True
    )  # Timestamp of transfer
    transfer_id = Column(String(100), nullable=True)  # Razorpay Transfer ID

    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class LabWallet(Base):
    __tablename__ = "lab_wallets"

    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), primary_key=True)
    pending_balance = Column(Integer, default=0, nullable=False)
    total_earned = Column(Integer, default=0, nullable=False)
    total_paid_out = Column(Integer, default=0, nullable=False)

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Ledger(Base):
    __tablename__ = "ledger"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"))

    type = Column(Enum(LedgerType), nullable=False)
    amount = Column(Integer, nullable=False)

    reference_type = Column(
        String(50), nullable=False
    )  # payment | refund | payout | adjustment
    reference_id = Column(UUID(as_uuid=True), nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
