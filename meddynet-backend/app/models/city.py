import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, Uuid

from app.database import Base


class City(Base):
    """
    Service cities/zones where MeddyNet operates.
    Used for filtering labs, technicians, and bookings by geography.
    """

    __tablename__ = "cities"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True, index=True)
    state = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False, default="India")

    # Geographic center of the city (for radius-based lab discovery)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    radius_km = Column(Float, nullable=True, default=25.0)  # Default service radius

    # Display metadata
    slug = Column(String(100), nullable=False, unique=True, index=True)
    pincode_prefix = Column(String(10), nullable=True)      # First digits of pincodes in this city
    lab_count = Column(Integer, default=0)                  # Cached count, updated periodically

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
