import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"))
    uploaded_by_tech_id = Column(
        UUID(as_uuid=True), ForeignKey("technicians.id"), nullable=True
    )

    cloud_url = Column(Text, nullable=False)
    cloud_path = Column(String(200), nullable=False)

    file_size_bytes = Column(Integer, nullable=False)
    is_abnormal = Column(Boolean, default=False)

    uploaded_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    notified_at = Column(DateTime(timezone=True), nullable=True)
