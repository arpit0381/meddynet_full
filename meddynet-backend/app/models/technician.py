import enum
import uuid

from sqlalchemy import Boolean, Column, Enum, Float, ForeignKey, String
from sqlalchemy import Uuid

from app.database import Base


class ShiftType(str, enum.Enum):
    morning = "morning"
    evening = "evening"
    full_day = "full_day"


class TechnicianStatus(str, enum.Enum):
    on_duty = "on_duty"
    idle = "idle"
    off_duty = "off_duty"
    on_break = "on_break"


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lab_id = Column(Uuid(as_uuid=True), ForeignKey("labs.id"))
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"))

    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False)
    vehicle = Column(String(50), nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)  # FIX 9: Added missing city column referenced by admin_portal

    shift = Column(Enum(ShiftType), nullable=False)
    status = Column(Enum(TechnicianStatus), default=TechnicianStatus.off_duty)

    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    rating = Column(Float, default=0.0)

    is_active = Column(Boolean, default=True)
