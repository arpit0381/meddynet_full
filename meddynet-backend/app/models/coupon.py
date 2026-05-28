import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, Integer, String, Uuid

from app.database import Base


class DiscountType(str, enum.Enum):
    percentage = "percentage"   # e.g. 20% off
    fixed = "fixed"             # e.g. ₹50 off


class Coupon(Base):
    """
    Promotional coupon codes for patient bookings.
    Validated at checkout to apply discounts.
    """

    __tablename__ = "coupons"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(30), nullable=False, unique=True, index=True)
    description = Column(String(200), nullable=True)

    discount_type = Column(Enum(DiscountType), nullable=False, default=DiscountType.percentage)
    discount_value = Column(Float, nullable=False)          # % or paise depending on type

    min_order_value = Column(Integer, nullable=True)        # Minimum cart value in paise
    max_discount_paise = Column(Integer, nullable=True)     # Cap for percentage discounts

    # Usage limits
    max_uses = Column(Integer, nullable=True)               # None = unlimited
    used_count = Column(Integer, default=0, nullable=False)
    max_uses_per_user = Column(Integer, nullable=True, default=1)

    # Validity window
    valid_from = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    valid_until = Column(DateTime(timezone=True), nullable=True)  # None = no expiry

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
