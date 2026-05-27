from datetime import date
from typing import Optional
from pydantic import BaseModel
from .user import UserResponse


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RegisterRequest(BaseModel):
    full_name: str
    phone_number: str
    dob: date
    email: str
    password: str


class LabOnboardingRequest(BaseModel):
    admin_name: str
    admin_email: str
    admin_password: str
    admin_phone: str

    lab_name: str
    lab_city: str
    lab_address: str
    lab_phone: str
    lab_lat: float = 0.0
    lab_lng: float = 0.0

    # New Fields
    registration_number: Optional[str] = None
    lab_category: Optional[str] = "Pathology Lab"
    state: Optional[str] = None
    pincode: Optional[str] = None
    branches: Optional[str] = "1"
    pathologist_name: Optional[str] = None
    pathologist_reg_no: Optional[str] = None
    nabl_certificate_url: Optional[str] = None
    is_certified: bool = False
