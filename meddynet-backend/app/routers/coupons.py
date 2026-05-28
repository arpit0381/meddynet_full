"""
Coupons Router — Promo code management and validation.
Admins manage coupon codes; patients validate them at checkout.
"""
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.coupon import Coupon, DiscountType

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/coupons", tags=["coupons"])


# ──────────────────────── Schemas ────────────────────────

class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=30)
    description: str | None = Field(None, max_length=200)
    discount_type: DiscountType = DiscountType.percentage
    discount_value: float = Field(..., gt=0)
    min_order_value: int | None = None          # paise
    max_discount_paise: int | None = None
    max_uses: int | None = None
    max_uses_per_user: int | None = 1
    valid_from: datetime | None = None
    valid_until: datetime | None = None


class CouponValidateRequest(BaseModel):
    code: str
    cart_total_paise: int = Field(..., gt=0)


def _check_admin(current_user: dict):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")


def _serialize_coupon(c: Coupon) -> dict:
    return {
        "id": str(c.id),
        "code": c.code,
        "description": c.description,
        "discount_type": c.discount_type.value,
        "discount_value": c.discount_value,
        "min_order_value": c.min_order_value,
        "max_discount_paise": c.max_discount_paise,
        "max_uses": c.max_uses,
        "used_count": c.used_count,
        "max_uses_per_user": c.max_uses_per_user,
        "valid_from": c.valid_from.isoformat() if c.valid_from else None,
        "valid_until": c.valid_until.isoformat() if c.valid_until else None,
        "is_active": c.is_active,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def _calculate_discount(coupon: Coupon, cart_total_paise: int) -> int:
    """Calculate the actual discount in paise for a given cart total."""
    if coupon.discount_type == DiscountType.percentage:
        discount = int(cart_total_paise * coupon.discount_value / 100)
        if coupon.max_discount_paise:
            discount = min(discount, coupon.max_discount_paise)
    else:
        discount = int(coupon.discount_value)  # fixed amount in paise

    return max(0, min(discount, cart_total_paise))  # Never exceed cart total


# ──────────────────────── Patient Endpoint ────────────────────────

@router.post("/validate")
async def validate_coupon(
    payload: CouponValidateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Validate a coupon code at checkout.
    Returns the discount amount if valid, or a clear error if not.
    Does NOT increment used_count — that happens on booking confirmation.
    """
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(Coupon).filter(Coupon.code == payload.code.upper().strip())
    )
    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon code not found")

    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="This coupon is no longer active")

    if coupon.valid_from and now < coupon.valid_from:
        raise HTTPException(status_code=400, detail="This coupon is not yet valid")

    if coupon.valid_until and now > coupon.valid_until:
        raise HTTPException(status_code=400, detail="This coupon has expired")

    if coupon.max_uses and coupon.used_count >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="This coupon has reached its usage limit")

    if coupon.min_order_value and payload.cart_total_paise < coupon.min_order_value:
        min_inr = coupon.min_order_value / 100
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order value of ₹{min_inr:.0f} required for this coupon",
        )

    discount_paise = _calculate_discount(coupon, payload.cart_total_paise)

    return {
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type.value,
        "discount_value": coupon.discount_value,
        "discount_paise": discount_paise,
        "discount_inr": round(discount_paise / 100, 2),
        "final_total_paise": payload.cart_total_paise - discount_paise,
        "final_total_inr": round((payload.cart_total_paise - discount_paise) / 100, 2),
        "description": coupon.description,
    }


# ──────────────────────── Admin Endpoints ────────────────────────

@router.get("")
async def list_coupons(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — list all coupons with optional active filter."""
    _check_admin(current_user)

    query = select(Coupon).order_by(Coupon.created_at.desc()).offset(skip).limit(limit)
    if active_only:
        query = query.filter(Coupon.is_active == True)  # noqa: E712

    result = await db.execute(query)
    return [_serialize_coupon(c) for c in result.scalars().all()]


@router.post("", status_code=201)
async def create_coupon(
    payload: CouponCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — create a new coupon code."""
    _check_admin(current_user)

    # Normalize code to uppercase
    normalized_code = payload.code.upper().strip()

    # Check for duplicate
    dup = await db.execute(select(Coupon).filter(Coupon.code == normalized_code))
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Coupon '{normalized_code}' already exists")

    data = payload.model_dump()
    data["code"] = normalized_code
    if not data.get("valid_from"):
        data["valid_from"] = datetime.now(timezone.utc)

    coupon = Coupon(**data)
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)

    logger.info(f"Coupon created: {coupon.code} ({coupon.discount_type.value}: {coupon.discount_value})")
    return _serialize_coupon(coupon)


@router.patch("/{coupon_id}/toggle")
async def toggle_coupon(
    coupon_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — activate or deactivate a coupon."""
    _check_admin(current_user)

    result = await db.execute(select(Coupon).filter(Coupon.id == uuid.UUID(coupon_id)))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    coupon.is_active = not coupon.is_active
    await db.commit()
    return {
        "message": f"Coupon '{coupon.code}' {'activated' if coupon.is_active else 'deactivated'}",
        "is_active": coupon.is_active,
    }


@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — permanently delete a coupon (only if unused)."""
    _check_admin(current_user)

    result = await db.execute(select(Coupon).filter(Coupon.id == uuid.UUID(coupon_id)))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    if coupon.used_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete coupon with {coupon.used_count} uses — deactivate it instead",
        )

    await db.delete(coupon)
    await db.commit()
    return {"message": f"Coupon '{coupon.code}' deleted permanently"}
