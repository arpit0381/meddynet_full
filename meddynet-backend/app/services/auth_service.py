import logging
import random
from datetime import datetime, timedelta, timezone

from jose import jwt
from supabase import Client, create_client

from app.config import settings
from app.redis import redis_client

logger = logging.getLogger(__name__)

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


# Using the provided Supabase config from settings.
try:
    # 1. Standard Anon Client (for user-facing Auth and DB ops)
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

    # 2. Admin Client (using Service Role for bypassing RLS in Storage/DB)
    # Only use this client for internal server-side operations!
    supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
except Exception as e:
    logger.error(f"Supabase client initialization failed: {e}")
    supabase = None
    supabase_admin = None


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")


def decode_token(token: str):
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return None


def create_tokens_pair(data: dict):
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    return access_token, refresh_token


def verify_refresh_token(token: str):
    return decode_token(token)


async def send_otp(email: str):
    otp = str(random.randint(100000, 999999))
    # Store OTP in redis for 5 minutes
    await redis_client.setex(f"otp:{email}", 300, otp)
    # Only log OTP in development for debugging
    if settings.ENVIRONMENT == "development":
        logger.info(f"[DEV] 2FA OTP for {email}: {otp}")
    return otp


async def verify_otp(email: str, otp: str):
    stored_otp = await redis_client.get(f"otp:{email}")
    if not stored_otp or stored_otp != otp:
        raise Exception("Invalid or expired OTP")
    # Clean up after successful verification
    await redis_client.delete(f"otp:{email}")
    return True


async def blacklist_token(token: str, redis_client):
    """
    Adds a token to the blacklist (Upstash/Local Redis) until it expires.
    """
    payload = decode_token(token)
    if not payload:
        return

    exp = payload.get("exp")
    if not exp:
        return

    now = datetime.now(timezone.utc).timestamp()
    ttl = int(exp - now)

    if ttl > 0:
        # Using "blacklist:" prefix for segmentation
        await redis_client.setex(f"blacklist:{token}", ttl, "true")


async def is_token_blacklisted(token: str, redis_client):
    return await redis_client.exists(f"blacklist:{token}")
