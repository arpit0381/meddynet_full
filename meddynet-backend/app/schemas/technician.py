import uuid
from typing import Optional

from pydantic import BaseModel

from app.models.technician import ShiftType, TechnicianStatus


class TechnicianBase(BaseModel):
    name: str
    phone: str
    vehicle: Optional[str] = None
    shift: ShiftType


class TechnicianCreate(TechnicianBase):
    pass


class TechnicianResponse(TechnicianBase):
    id: uuid.UUID
    lab_id: uuid.UUID
    user_id: uuid.UUID
    status: TechnicianStatus
    current_lat: Optional[float]
    current_lng: Optional[float]
    rating: float
    is_active: bool

    class Config:
        from_attributes = True


class LocationUpdate(BaseModel):
    lat: float
    lng: float


class TrackingResponse(BaseModel):
    tech_id: uuid.UUID
    tech_name: str
    lat: Optional[float]
    lng: Optional[float]
    status: TechnicianStatus
    booking_status: str
