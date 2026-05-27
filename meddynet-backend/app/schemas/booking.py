import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.booking import BookingType, BookingStatus

class BookingTestCreate(BaseModel):
    lab_test_id: uuid.UUID
    price_at_booking: int

class BookingTestResponse(BaseModel):
    id: uuid.UUID
    lab_test_id: uuid.UUID
    price_at_booking: int

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    lab_id: uuid.UUID
    type: BookingType
    scheduled_at: datetime
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    patient_name: str
    patient_phone: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    promo_code: Optional[str] = None
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    test_ids: List[uuid.UUID]

class LabQuickScheduleRequest(BaseModel):
    patient_name: str
    patient_phone: str = "0000000000"
    type: BookingType
    scheduled_at: datetime
    test_ids: List[uuid.UUID] = []
    notes: Optional[str] = None

class BookingResponse(BookingBase):
    id: uuid.UUID
    user_id: uuid.UUID
    tech_id: Optional[uuid.UUID] = None
    status: BookingStatus
    total_amount: int
    discount_amount: int
    cancelled_at: Optional[datetime] = None
    cancel_reason: Optional[str] = None
    created_at: datetime
    tests: List[BookingTestResponse] = []
    
    # Razorpay Transient Fields
    razorpay_order_id: Optional[str] = None
    amount: Optional[int] = None

    class Config:
        from_attributes = True
