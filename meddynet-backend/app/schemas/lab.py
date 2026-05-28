import uuid
from typing import List, Optional

from pydantic import ConfigDict, BaseModel

from app.models.lab import SubscriptionPlan


class LabTestBase(BaseModel):
    name: str
    category: str
    price: int
    mrp: int
    turnaround_hours: int
    home_collection: bool = False
    is_active: bool = True


class LabTestCreate(LabTestBase):
    lab_id: uuid.UUID


class LabTestResponse(LabTestBase):
    id: uuid.UUID
    lab_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class LabBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    city: str
    address: str
    lat: float
    lng: float
    is_nabl: bool = False
    is_iso: bool = False
    home_collection: bool = False


class LabCreate(LabBase):
    pass


class LabResponse(LabBase):
    id: uuid.UUID
    slug: str
    is_verified: bool
    plan: SubscriptionPlan
    commission_rate: float
    is_active: bool
    avg_rating: Optional[float] = 4.5
    review_count: Optional[int] = 0
    distance: Optional[float] = None
    tests: List[LabTestResponse] = []

    model_config = ConfigDict(from_attributes=True)
