import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    blood_group = Column(String(5), nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    role = Column(String(20), default="user")
    hashed_password = Column(String(255), nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    age = Column(String(5), nullable=True)
    pan_card = Column(String(10), nullable=True, index=True)

    # Store settings & UI configurations like WhatsApp toggles, booking updates directly.
    preferences = Column(JSON, default=lambda: {})
    addresses = Column(JSON, default=lambda: [])

    # Context IDs
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=True)
    technician_id = Column(UUID(as_uuid=True), ForeignKey("technicians.id"), nullable=True)

    # Financials
    wallet_balance = Column(Integer, default=0, nullable=False)  # Balance in paise

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
