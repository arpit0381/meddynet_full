from fastapi import APIRouter, Depends, HTTPException, status, Request, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
import uuid
import logging

logger = logging.getLogger(__name__)

from app.database import get_db
from app.schemas.auth import (
    SendOTPRequest,
    VerifyOTPRequest,
    TokenResponse,
    RefreshTokenRequest,
    LoginRequest,
    RegisterRequest,
    LabOnboardingRequest,
)
from app.models.user import User
from app.models.lab import Lab
from app.models.payment import LabWallet
from app.services.auth_service import (
    send_otp,
    verify_otp,
    create_access_token,
    create_refresh_token,
    blacklist_token,
    verify_password,
    get_password_hash,
)
from app.services.notification_service import notification_service
from app.middleware.rbac import get_current_user
from app.redis import limiter, redis_client
from app.services.supabase_storage_service import storage_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/upload-doc")
async def upload_onboarding_doc(file: UploadFile = File(...)):
    """
    Temporary upload for onboarding documents before formal lab_id is created.
    Uses a temporary directory structure.
    """
    temp_id = str(uuid.uuid4())
    result = await storage_service.upload_lab_document(file, f"temp_{temp_id}")
    if not result:
        raise HTTPException(status_code=500, detail="Failed to upload document")
    return {"url": result["url"], "path": result["path"]}


@router.post("/register", response_model=TokenResponse)
async def register_route(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).filter(
            (func.lower(User.email) == func.lower(payload.email)) | (User.phone == payload.phone_number)
        )
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")

    hashed_pw = get_password_hash(payload.password)
    from datetime import date

    dob_val = payload.dob
    if isinstance(dob_val, str):
        dob_val = date.fromisoformat(dob_val)

    user = User(
        name=payload.full_name,
        phone=payload.phone_number,
        email=payload.email,
        dob=dob_val,
        hashed_password=hashed_pw,
        role="user",
        is_active=True,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    token_data = {
        "sub": str(user.id),
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "lab_id": str(user.lab_id) if getattr(user, "lab_id", None) else None,
        "technician_id": (str(user.technician_id) if getattr(user, "technician_id", None) else None),
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}


@router.get("/check-unique")
async def check_uniqueness(type: str, value: str, db: AsyncSession = Depends(get_db)):
    """Check if email or phone is already registered."""
    if type == "email":
        res = await db.execute(select(User).filter(func.lower(User.email) == func.lower(value)))
    elif type == "phone":
        res = await db.execute(select(User).filter(User.phone == value))
    else:
        return {"exists": False}

    user = res.scalar_one_or_none()
    return {
        "exists": user is not None,
        "role": user.role if user else None,
        "is_lab_staff": (user.role in ["lab", "lab_admin", "lab_staff"] if user else False),
    }


@router.post("/register-lab", response_model=TokenResponse)
async def register_lab(payload: LabOnboardingRequest, db: AsyncSession = Depends(get_db)):
    res_email = await db.execute(select(User).filter(func.lower(User.email) == func.lower(payload.admin_email)))
    existing_user_by_email = res_email.scalar_one_or_none()

    res_phone = await db.execute(select(User).filter(User.phone == payload.admin_phone))
    existing_user_by_phone = res_phone.scalar_one_or_none()

    target_user = existing_user_by_email or existing_user_by_phone

    if target_user:
        if target_user.role in ["lab_admin", "lab_staff", "lab", "admin"]:
            logger.warning(f"Conflict: User '{target_user.email}' already has administrative role: {target_user.role}")
            field = "Email" if existing_user_by_email else "Phone"
            raise HTTPException(
                status_code=400,
                detail=f"{field} already registered with an active Lab account.",
            )

        logger.info(f"Existing patient user '{target_user.email}' upgrading role to 'lab_admin'.")
        # Pre-existing patient is becoming a lab admin
        target_user.role = "lab_admin"
        target_user.hashed_password = get_password_hash(payload.admin_password)
        target_user.name = payload.admin_name
        # Keep same email/phone
    else:
        logger.info(f"Creating new user for lab registration: {payload.admin_email}")
        target_user = User(
            name=payload.admin_name,
            email=payload.admin_email,
            phone=payload.admin_phone,
            hashed_password=get_password_hash(payload.admin_password),
            role="lab_admin",
        )
        db.add(target_user)

    import uuid

    lab_id = uuid.uuid4()
    target_user.lab_id = lab_id

    # 2. Create the Lab (Starts as unverified)
    slug = f"{payload.lab_name.lower().replace(' ', '-')}-{str(uuid.uuid4())[:6]}"
    new_lab = Lab(
        id=lab_id,
        name=payload.lab_name,
        slug=slug,
        phone=payload.lab_phone,
        city=payload.lab_city,
        address=payload.lab_address,
        lat=payload.lab_lat,
        lng=payload.lab_lng,
        # New onboarding fields
        registration_number=payload.registration_number,
        lab_category=payload.lab_category,
        state=payload.state,
        pincode=payload.pincode,
        branches=payload.branches,
        pathologist_name=payload.pathologist_name,
        pathologist_reg_no=payload.pathologist_reg_no,
        nabl_certificate_url=payload.nabl_certificate_url,
        is_certified=payload.is_certified,
        is_verified=False,
    )
    db.add(new_lab)

    # 4. Initialize Lab Wallet
    wallet = LabWallet(lab_id=lab_id)
    db.add(wallet)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")

    await db.refresh(target_user)

    # 5. Notify Platform Admin (Cross-Portal Persistence)
    # This ensure registration doesn't fail even if secondary tracking fails
    try:
        from app.services.mongo_service import mongo_service

        await mongo_service.track_activity(
            user_id=str(target_user.id),
            action="onboard",
            resource="lab",
            resource_id=str(lab_id),
            metadata={
                "lab_name": payload.lab_name,
                "category": payload.lab_category,
                "city": payload.lab_city,
                "is_nabl": bool(payload.nabl_certificate_url),
            },
        )

        await mongo_service.log_event(
            level="info",
            event="lab_registered",
            message=f"New Lab '{payload.lab_name}' registered from {payload.lab_city}.",
            context={"lab_id": str(lab_id), "admin_email": payload.admin_email},
        )
    except Exception as e:
        logger.warning(f"Non-critical: Platform tracking failed during lab registration: {e}")

    # Generate tokens
    token_data = {
        "sub": str(target_user.id),
        "phone": target_user.phone,
        "role": target_user.role,
        "is_active": target_user.is_active,
        "lab_id": str(target_user.lab_id),
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": target_user,
    }


@router.post("/send-otp")
@limiter.limit("5/minute")
async def send_otp_route(request: Request, payload: SendOTPRequest):
    try:
        otp = await send_otp(payload.phone)

        try:
            await notification_service.send_verification_otp(payload.phone, otp)
        except Exception as e:
            logger.error(f"OTP notification delivery failed for {payload.phone}: {e}")

        return {"message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="OTP request failed. Please try again.")


@router.post("/verify-otp")
async def verify_otp_route(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    try:
        await verify_otp(payload.phone, payload.otp)

        # Check if user exists in DB
        result = await db.execute(select(User).filter(User.phone == payload.phone))
        user = result.scalar_one_or_none()

        if not user:
            # Create new user context.
            user = User(phone=payload.phone, name="New User", role="user")
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # Map role and context IDs
        token_data = {
            "sub": str(user.id),
            "phone": user.phone,
            "role": user.role,
            "lab_id": str(user.lab_id) if user.lab_id else None,
            "technician_id": str(user.technician_id) if user.technician_id else None,
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": str(user.id),
                "phone": user.phone,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "name": user.name,
                "lab_id": user.lab_id,
                "technician_id": user.technician_id,
            },
        }
    except Exception as e:
        logger.error(f"OTP verification failed for {payload.phone}: {e}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail="OTP verification failed. Please check and try again.",
        )


# FIX 5: Added rate limiting to prevent brute-force password attacks
@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    logger.info(f"Login attempt for email='{payload.email}'")
    result = await db.execute(select(User).filter(func.lower(User.email) == func.lower(payload.email)))
    user = result.scalar_one_or_none()

    if not user:
        logger.warning(f"Login failed: user '{payload.email}' not found")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.hashed_password:
        logger.warning(f"Login failed: user '{payload.email}' has no password set")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user.hashed_password):
        logger.warning(f"Login failed: password mismatch for '{payload.email}'")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info(f"Login success for user='{payload.email}', role='{user.role}'")

    # ─── 2FA Check ───
    prefs = user.preferences or {}
    if prefs.get("two_fa_enabled"):
        # Send OTP and return a temporary challenge token
        otp = await send_otp(user.phone)
        # Create a short-lived temp token (5 min) to identify the user for the next step
        import time

        temp_payload = {
            "sub": str(user.id),
            "type": "2fa_challenge",
            "exp": int(time.time()) + 300,
        }
        temp_token = create_access_token(temp_payload)
        response = {
            "requires_2fa": True,
            "temp_token": temp_token,
            "phone_hint": user.phone[-4:],
        }
        # FIX 10: OTP logged server-side only, never in HTTP response
        from app.config import settings

        if settings.ENVIRONMENT == "development":
            logger.debug(f"[DEV ONLY] 2FA OTP for {user.phone}: {otp}")
        return response
    # ─── Normal Login (no 2FA) ───
    token_data = {
        "sub": str(user.id),
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "lab_id": str(user.lab_id) if user.lab_id else None,
        "technician_id": str(user.technician_id) if user.technician_id else None,
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "requires_2fa": False,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "lab_id": str(user.lab_id) if user.lab_id else None,
        },
    }


class TwoFALoginVerifyRequest(BaseModel):
    temp_token: str
    otp: str


@router.post("/2fa/login-verify", response_model=TokenResponse)
async def verify_2fa_login(payload: TwoFALoginVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Second step of 2FA login: verify OTP using temp_token and return real auth tokens."""
    from app.services.auth_service import decode_token

    token_data = decode_token(payload.temp_token)

    if not token_data or token_data.get("type") != "2fa_challenge":
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired 2FA session. Please login again.",
        )

    user_id = token_data.get("sub")
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify OTP
    is_valid = await verify_otp(user.phone, payload.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # OTP valid — issue real tokens
    real_token_data = {
        "sub": str(user.id),
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "lab_id": str(user.lab_id) if user.lab_id else None,
        "technician_id": str(user.technician_id) if user.technician_id else None,
    }
    access_token = create_access_token(real_token_data)
    refresh_token = create_refresh_token(real_token_data)
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}


class VerifyPasswordRequest(BaseModel):
    password: str


@router.post("/verify-password")
async def verify_password_endpoint(
    payload: VerifyPasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = result.scalar_one_or_none()

    if not user or not getattr(user, "hashed_password", None):
        return {"is_correct": False}

    is_valid = verify_password(payload.password, user.hashed_password)
    return {"is_correct": is_valid}


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = result.scalar_one_or_none()

    if not user or not getattr(user, "hashed_password", None):
        raise HTTPException(status_code=400, detail="User not found or password not set")

    if not verify_password(payload.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()

    return {"message": "Password updated successfully"}


@router.post("/refresh")
async def refresh_token(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    from app.services.auth_service import decode_token

    token_data = decode_token(payload.refresh_token)

    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Re-issue access token with same metadata (sub/phone/role/contexts)
    # We might want to fetch latest user record to ensure roles haven't changed.
    uid = token_data.get("sub")
    res = await db.execute(select(User).filter(User.id == uid))
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_data = {
        "sub": str(user.id),
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "lab_id": str(user.lab_id) if user.lab_id else None,
        "technician_id": str(user.technician_id) if user.technician_id else None,
    }

    new_access_token = create_access_token(new_data)

    return {"access_token": new_access_token}


@router.post("/logout")
async def logout(request: Request, current_user: dict = Depends(get_current_user)):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        await blacklist_token(token, redis_client)
    return {"message": "Logged out successfully"}


# ─────────────────────────── 2FA Endpoints ───────────────────────────


class TwoFAVerifyRequest(BaseModel):
    otp: str


@router.post("/2fa/enable")
async def enable_2fa(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Send a 6-digit OTP to the user's phone to enable 2FA."""
    result = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Reuse existing OTP infrastructure (stored in Redis)
    otp = await send_otp(user.phone)
    response = {
        "message": "OTP sent to your registered phone number",
        "phone": user.phone[-4:],
    }
    # FIX 10: OTP logged server-side only, never in HTTP response
    from app.config import settings

    if settings.ENVIRONMENT == "development":
        logger.debug(f"[DEV ONLY] 2FA enable OTP for {user.phone}: {otp}")
    return response


@router.post("/2fa/verify")
async def verify_2fa(
    payload: TwoFAVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify the OTP and enable 2FA for the user."""
    result = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_valid = await verify_otp(user.phone, payload.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Store 2FA status in user preferences
    prefs = user.preferences or {}
    prefs["two_fa_enabled"] = True
    user.preferences = prefs
    await db.commit()
    return {"message": "2FA enabled successfully", "two_fa_enabled": True}


@router.post("/2fa/disable")
async def disable_2fa(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Disable 2FA for the user (requires re-verify via password in frontend)."""
    result = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    prefs = user.preferences or {}
    prefs["two_fa_enabled"] = False
    user.preferences = prefs
    await db.commit()
    return {"message": "2FA disabled successfully", "two_fa_enabled": False}
