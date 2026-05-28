import uuid
from datetime import datetime

from pydantic import ConfigDict, BaseModel

from app.models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    booking_id: uuid.UUID


class DepositCreate(BaseModel):
    amount: int  # Amount in paisa


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    id: uuid.UUID
    booking_id: uuid.UUID
    user_id: uuid.UUID
    lab_id: uuid.UUID
    razorpay_order_id: str
    total_amount: int
    commission_amount: int
    lab_amount: int
    status: PaymentStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
