"""
Cities Router — Geographic service area management.
Public endpoint for city discovery; admin CRUD for managing service zones.
"""
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.city import City
from app.models.lab import Lab

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/cities", tags=["cities"])


# ──────────────────────── Schemas ────────────────────────

class CityCreate(BaseModel):
    name: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    country: str = Field(default="India", max_length=100)
    lat: float | None = None
    lng: float | None = None
    radius_km: float | None = 25.0
    slug: str = Field(..., max_length=100)
    pincode_prefix: str | None = Field(None, max_length=10)


class CityUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    state: str | None = None
    lat: float | None = None
    lng: float | None = None
    radius_km: float | None = None
    is_active: bool | None = None


def _check_admin(current_user: dict):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")


def _serialize_city(city: City) -> dict:
    return {
        "id": str(city.id),
        "name": city.name,
        "state": city.state,
        "country": city.country,
        "lat": city.lat,
        "lng": city.lng,
        "radius_km": city.radius_km,
        "slug": city.slug,
        "pincode_prefix": city.pincode_prefix,
        "lab_count": city.lab_count,
        "is_active": city.is_active,
        "created_at": city.created_at.isoformat() if city.created_at else None,
    }


# ──────────────────────── Public Endpoints ────────────────────────

@router.get("")
async def list_cities(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Public — list all active service cities."""
    result = await db.execute(
        select(City)
        .filter(City.is_active == True)  # noqa: E712
        .order_by(City.name.asc())
        .offset(skip)
        .limit(limit)
    )
    return [_serialize_city(c) for c in result.scalars().all()]


@router.get("/{slug}")
async def get_city(slug: str, db: AsyncSession = Depends(get_db)):
    """Public — get city details by slug."""
    result = await db.execute(select(City).filter(City.slug == slug, City.is_active == True))  # noqa: E712
    city = result.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return _serialize_city(city)


# ──────────────────────── Admin Endpoints ────────────────────────

@router.post("", status_code=201)
async def create_city(
    payload: CityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — add a new service city."""
    _check_admin(current_user)

    # Check for duplicate name or slug
    dup = await db.execute(
        select(City).filter(
            (City.name == payload.name) | (City.slug == payload.slug)
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="City with this name or slug already exists")

    city = City(**payload.model_dump())
    db.add(city)
    await db.commit()
    await db.refresh(city)
    logger.info(f"City created: {city.name}, {city.state}")
    return _serialize_city(city)


@router.patch("/{city_id}")
async def update_city(
    city_id: str,
    payload: CityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — update city details."""
    _check_admin(current_user)

    result = await db.execute(select(City).filter(City.id == uuid.UUID(city_id)))
    city = result.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(city, field, value)

    await db.commit()
    await db.refresh(city)
    return _serialize_city(city)


@router.post("/{city_id}/refresh-lab-count")
async def refresh_lab_count(
    city_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin — recompute the lab_count cache for a city."""
    _check_admin(current_user)

    result = await db.execute(select(City).filter(City.id == uuid.UUID(city_id)))
    city = result.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    count_res = await db.execute(
        select(func.count(Lab.id)).filter(
            func.lower(Lab.city) == city.name.lower(),
            Lab.is_active == True,  # noqa: E712
            Lab.is_verified == True,  # noqa: E712
        )
    )
    city.lab_count = count_res.scalar() or 0
    await db.commit()

    return {"city": city.name, "lab_count": city.lab_count}
