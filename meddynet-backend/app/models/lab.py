import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Float,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Enum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base


class SubscriptionPlan(str, enum.Enum):
    starter = "starter"
    basic = "basic"
    advanced = "advanced"
    premium = "premium"


class Lab(Base):
    __tablename__ = "labs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(15), nullable=False)
    email = Column(String(100), nullable=True)
    razorpay_account_id = Column(String(50), nullable=True)  # Linked account for Razorpay Route
    city = Column(String(100), nullable=False, index=True)
    address = Column(Text, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    image_url = Column(Text, nullable=True)

    is_nabl = Column(Boolean, default=False)
    is_iso = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    home_collection = Column(Boolean, default=True)

    # Newly Added Fields for Detailed Onboarding
    registration_number = Column(String(100), nullable=True)
    lab_category = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    branches = Column(String(20), nullable=True)
    pathologist_name = Column(String(200), nullable=True)
    pathologist_reg_no = Column(String(100), nullable=True)
    nabl_certificate_url = Column(Text, nullable=True)
    is_certified = Column(Boolean, default=False)

    plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.basic)
    commission_rate = Column(Float, default=0.15)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    tests = relationship("LabTest", back_populates="lab", cascade="all, delete-orphan")


class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id", ondelete="CASCADE"))

    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)  # in paise
    mrp = Column(Integer, nullable=False)  # in paise
    turnaround_hours = Column(Integer, nullable=False)
    home_collection = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)

    lab = relationship("Lab", back_populates="tests")
