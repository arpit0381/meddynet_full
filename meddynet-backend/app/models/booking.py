import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class BookingType(str, enum.Enum):
    home_collection = "home_collection"
    lab_visit = "lab_visit"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    assigned = "assigned"
    on_the_way = "on_the_way"
    arrived = "arrived"
    sample_collected = "sample_collected"
    report_ready = "report_ready"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=False)
    technician_id = Column("tech_id", UUID(as_uuid=True), ForeignKey("technicians.id"), nullable=True)

    type = Column(Enum(BookingType), nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)

    address = Column(Text, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    patient_name = Column(String(100), nullable=False)
    patient_phone = Column(String(15), nullable=False)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String(10), nullable=True)

    total_amount = Column(Integer, nullable=False)  # In paise
    promo_code = Column(String(50), nullable=True)
    discount_amount = Column(Integer, default=0)  # In paise
    notes = Column(Text, nullable=True)

    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancel_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    tests = relationship("BookingTest", back_populates="booking", cascade="all, delete-orphan")


class BookingTest(Base):
    __tablename__ = "booking_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"))
    lab_test_id = Column(UUID(as_uuid=True), ForeignKey("lab_tests.id"))

    price_at_booking = Column(Integer, nullable=False)

    booking = relationship("Booking", back_populates="tests")
