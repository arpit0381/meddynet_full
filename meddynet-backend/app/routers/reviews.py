"""
Reviews Router — Patient reviews for labs after completed bookings.
Allows patients to submit ratings/comments; labs and admins can view them.
"""
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ConfigDict, BaseModel, Field
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.booking import Booking, BookingStatus
from app.models.lab import Lab
from app.models.review import Review

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reviews", tags=["reviews"])


# ──────────────────────── Schemas ────────────────────────

class ReviewCreate(BaseModel):
    lab_id: uuid.UUID
    booking_id: uuid.UUID
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: str | None = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    id: uuid.UUID
    lab_id: uuid.UUID
    booking_id: uuid.UUID
    rating: float
    comment: str | None
    created_at: str

    model_config = ConfigDict(from_attributes=True)


# ──────────────────────── Endpoints ────────────────────────

@router.post("", response_model=ReviewResponse)
async def submit_review(
    payload: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a review for a lab after a completed booking.
    Each patient can only review a given booking once.
    """
    user_id = uuid.UUID(current_user["sub"])

    # 1. Verify the booking exists, belongs to this user, and is completed
    b_res = await db.execute(
        select(Booking).filter(
            Booking.id == payload.booking_id,
            Booking.user_id == user_id,
            Booking.lab_id == payload.lab_id,
        )
    )
    booking = b_res.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or does not belong to you")

    if booking.status != BookingStatus.completed:
        raise HTTPException(
            status_code=400,
            detail="You can only review a booking after it has been completed",
        )

    # 2. Prevent duplicate reviews for the same booking
    existing_res = await db.execute(
        select(Review).filter(
            Review.booking_id == payload.booking_id,
            Review.user_id == user_id,
        )
    )
    if existing_res.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You have already reviewed this booking")

    # 3. Create the review
    review = Review(
        user_id=user_id,
        lab_id=payload.lab_id,
        booking_id=payload.booking_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    logger.info(f"Review submitted: booking={payload.booking_id}, rating={payload.rating}")
    return ReviewResponse(
        id=review.id,
        lab_id=review.lab_id,
        booking_id=review.booking_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at.isoformat(),
    )


@router.get("/lab/{lab_id}")
async def get_lab_reviews(
    lab_id: str,
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint — fetch reviews for a specific lab.
    Returns paginated reviews with average rating summary.
    """
    lab_uuid = uuid.UUID(lab_id)

    # Verify lab exists
    lab_res = await db.execute(select(Lab).filter(Lab.id == lab_uuid))
    lab = lab_res.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    # Aggregate stats
    stats_res = await db.execute(
        select(
            func.count(Review.id).label("total"),
            func.avg(Review.rating).label("avg_rating"),
        ).filter(Review.lab_id == lab_uuid)
    )
    stats = stats_res.first()
    total = stats.total or 0
    avg_rating = round(float(stats.avg_rating or 0), 1)

    # Paginated reviews
    reviews_res = await db.execute(
        select(Review)
        .filter(Review.lab_id == lab_uuid)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    reviews = reviews_res.scalars().all()

    return {
        "lab_id": lab_id,
        "lab_name": lab.name,
        "total_reviews": total,
        "average_rating": avg_rating,
        "reviews": [
            {
                "id": str(r.id),
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat(),
            }
            for r in reviews
        ],
    }


@router.get("/admin/all")
async def list_all_reviews(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin endpoint — list all reviews across the platform."""
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.execute(
        select(Review, Lab.name.label("lab_name"))
        .join(Lab, Review.lab_id == Lab.id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    reviews = []
    for row in result.all():
        r, lab_name = row
        reviews.append(
            {
                "id": str(r.id),
                "lab_id": str(r.lab_id),
                "lab_name": lab_name,
                "booking_id": str(r.booking_id),
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat(),
            }
        )

    return reviews
