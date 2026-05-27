from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    SECRET_KEY: str

    DATABASE_URL: str
    NEON_DATABASE_URL: Optional[str] = None  # For production serverless DB

    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_JWT_SECRET: Optional[str] = None  # To validate Supabase native tokens

    JWT_SECRET_KEY: str

    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str
    RAZORPAYX_ACCOUNT_NUMBER: Optional[str] = None  # For Payouts

    REDIS_URL: str
    UPSTASH_REDIS_URL: Optional[str] = None  # Production Redis

    MONGODB_URL: str
    MONGODB_DB_NAME: str = "meddynet_analytics"

    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    MSG91_AUTH_KEY: Optional[str] = None
    MSG91_TEMPLATE_ID: Optional[str] = None

    AUTHKEY_API_KEY: Optional[str] = None
    AUTHKEY_SENDER_ID: Optional[str] = "MEDDYN"

    # WhatsApp Business API (Meta Cloud API)
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:3003"
    )
    ALLOWED_ADMIN_IPS: Optional[str] = None

    FERNET_KEY: str

    # Portal Discovery (Super Ultra Deep Infrastructure)
    LAB_PORTAL_URL: str = "http://localhost:3001"
    ADMIN_PORTAL_URL: str = "http://localhost:3002"
    TECHNICIAN_PORTAL_URL: str = "http://localhost:3003"
    PATIENT_PORTAL_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def allowed_admin_ips_list(self) -> List[str]:
        if not self.ALLOWED_ADMIN_IPS:
            return []
        return [ip.strip() for ip in self.ALLOWED_ADMIN_IPS.split(",") if ip.strip()]


settings = Settings()
