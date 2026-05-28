import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, Integer, String, Text, Uuid

from app.database import Base


class BillingCycle(str, enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    annual = "annual"


class PlanTier(str, enum.Enum):
    starter = "starter"
    basic = "basic"
    advanced = "advanced"
    premium = "premium"


class SubscriptionPlan(Base):
    """
    Platform subscription plans for labs.
    Labs subscribe to a plan to access MeddyNet features.
    """

    __tablename__ = "subscription_plans"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    tier = Column(Enum(PlanTier), nullable=False, default=PlanTier.basic)
    billing_cycle = Column(Enum(BillingCycle), nullable=False, default=BillingCycle.monthly)

    # Pricing (in paise)
    price_paise = Column(Integer, nullable=False, default=0)

    # Feature limits
    max_tests = Column(Integer, nullable=True)         # None = unlimited
    max_bookings_per_month = Column(Integer, nullable=True)  # None = unlimited
    commission_rate = Column(Float, nullable=False, default=0.15)  # Platform commission
    home_collection_enabled = Column(Boolean, default=True)
    analytics_enabled = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)

    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
