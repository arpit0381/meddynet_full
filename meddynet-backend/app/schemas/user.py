import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, model_validator


class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    age: Optional[str] = None
    pan_card: Optional[str] = None
    profile_image_url: Optional[str] = None
    preferences: Optional[dict] = None
    addresses: Optional[list] = None


class UserCreate(UserBase):
    name: str
    phone: str


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: Optional[str] = None
    phone: str
    role: str
    wallet_balance: Optional[int] = 0
    is_active: bool
    blood_group: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    age: Optional[str] = None
    pan_card: Optional[str] = None
    profile_image_url: Optional[str] = None
    preferences: Optional[dict] = None
    addresses: Optional[list] = None
    created_at: datetime
    updated_at: datetime
    lab_id: Optional[uuid.UUID] = None
    technician_id: Optional[uuid.UUID] = None

    @model_validator(mode="after")
    def compute_age_from_dob(self):
        """Dynamically calculate age from date of birth."""
        if self.dob:
            today = date.today()
            age = today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))
            self.age = str(age)
        return self

    class Config:
        from_attributes = True
