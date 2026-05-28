"""
Subscriptions Router — Lab subscription plan management.
Admins manage plans; labs can view available plans and their current plan.
"""
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.subscription import BillingCycle, PlanTier, SubscriptionPlan

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


# ──────────────────────── Schemas ────────────────────────

class PlanCreate(BaseModel):
    name: str = Field(..., max_length=100)
    tier: PlanTier
    billing_cycle: BillingCycle = BillingCycle.monthly
    price_paise: int = Field(..., ge=0)
    max_tests: int | None = None
    max_bookings_per_month: int | None = None
    commission_rate: float = Field(default=0.15, ge=0.0, le=1.0)
    home_collection_enabled: bool = True
    analytics_enabled: bool = False
    priority_support: bool = False
    description: str | None = None


class PlanUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    price_paise: int | None = Field(None, ge=0)
    commission_rate: float | None = Field(None, ge=0.0, le=1.0)
    analytics_enabled: bool | None = None
    priority_support: bool | None = None
    description: str | None = None
    is_active: bool | None = None


def _check_admin(current_user: dict):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")


def _serialize_plan(plan: SubscriptionPlan) -> dict:
    return {
        "id": str(plan.id),
        "name": plan.name,
        "tier": plan.tier.value,
        "billing_cycle": plan.billing_cycle.value,
        "price_paise": plan.price_paise,
        "price_inr": round(plan.price_paise / 100, 2),
        "max_tests": plan.max_tests,
        "max_bookings_per_month": plan.max_bookings_per_month,
        "commission_rate": plan.commission_rate,
        "home_collection_enabled": plan.home_collection_enabled,
        "analytics_enabled": plan.analytics_enabled,
        "priority_support": plan.priority_support,
        "description": plan.description,
        "is_active": plan.is_active,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
    }


# ──────────────────────── Public Endpoints ────────────────────────

@router.get("")
async def list_plans(
    skip: int = 0,
    limit: int = Query(default=20, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Public — list all active subscription plans."""
    result = await db.execute(
        select(SubscriptionPlan)
        .filter(SubscriptionPlan.is_active == True)  # noqa: E712
        .order_by(SubscriptionPlan.price_paise.asc())
        .offset(skip)
        .limit(limit)
    )
    plans = result.scalars().all()
    return [_serialize_plan(p) for p in plans]


@router.get("/{plan_id}")
async def get_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    """Public — get a specific plan by ID."""
    result = await db.execute(
        select(SubscriptionPlan).filter(SubscriptionPlan.id == uuid.UUID(plan_id))
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return _serialize_plan(plan)


# ──────────────────────── Admin Endpoints ────────────────────────

@router.post("", status_code=201)
async def create_plan(
    payload: PlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — create a new subscription plan."""
    _check_admin(current_user)

    # Check for duplicate name
    dup = await db.execute(
        select(SubscriptionPlan).filter(SubscriptionPlan.name == payload.name)
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Plan '{payload.name}' already exists")

    plan = SubscriptionPlan(**payload.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    logger.info(f"Plan created: {plan.name} ({plan.tier})")
    return _serialize_plan(plan)


@router.patch("/{plan_id}")
async def update_plan(
    plan_id: str,
    payload: PlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — update an existing subscription plan."""
    _check_admin(current_user)

    result = await db.execute(
        select(SubscriptionPlan).filter(SubscriptionPlan.id == uuid.UUID(plan_id))
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(plan, field, value)

    await db.commit()
    await db.refresh(plan)
    return _serialize_plan(plan)


@router.delete("/{plan_id}")
async def deactivate_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — soft-deactivate a plan (never hard delete — labs may still be on it)."""
    _check_admin(current_user)

    result = await db.execute(
        select(SubscriptionPlan).filter(SubscriptionPlan.id == uuid.UUID(plan_id))
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.is_active = False
    await db.commit()
    return {"message": f"Plan '{plan.name}' deactivated successfully"}
