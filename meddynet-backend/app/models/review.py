import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Text, Uuid

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    lab_id = Column(Uuid(as_uuid=True), ForeignKey("labs.id"))
    booking_id = Column(Uuid(as_uuid=True), ForeignKey("bookings.id"))

    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
