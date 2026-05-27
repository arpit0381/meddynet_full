import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text, Uuid

from app.database import Base


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String(200), nullable=False)
    record_type = Column(String(50), default="prescription")  # prescription, report, scan, other

    file_url = Column(Text, nullable=False)
    file_path = Column(String(200), nullable=True)  # Cloud storage path
    file_size_bytes = Column(Integer, nullable=True)

    doctor_name = Column(String(100), nullable=True)
    hospital_name = Column(String(100), nullable=True)

    # Store AI extracted suggestions or other test data
    metadata_json = Column(JSON, default=lambda: {})

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
