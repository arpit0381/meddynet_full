import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user, require_role
from app.models.booking import Booking, BookingStatus
from app.models.technician import Technician, TechnicianStatus
from app.schemas.booking import BookingResponse
from app.schemas.technician import LocationUpdate
from app.services.mongo_service import mongo_service
from app.services.report_service import upload_report_to_supabase

router = APIRouter(prefix="/technician", tags=["technician-portal"])
logger = logging.getLogger(__name__)


@router.get("/me/stats")
async def get_tech_stats(
    current_user: dict = Depends(require_role(["technician"])),
    db: AsyncSession = Depends(get_db),
):
    tech_id = current_user.get("technician_id")
    if not tech_id:
        tech_res = await db.execute(select(Technician).filter(Technician.user_id == current_user["sub"]))
        tech = tech_res.scalar_one_or_none()
        if not tech:
            raise HTTPException(status_code=404, detail="Technician profile not found")
        tech_id = tech.id
    else:
        tech_id = uuid.UUID(tech_id)

    # 1. Total Earnings (all-time)
    completed_res = await db.execute(
        select(func.sum(Booking.total_amount)).filter(
            Booking.technician_id == tech_id, Booking.status == BookingStatus.completed
        )
    )
    total_earnings = completed_res.scalar() or 0

    # 2. Daily Earnings (today)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_res = await db.execute(
        select(func.sum(Booking.total_amount)).filter(
            Booking.technician_id == tech_id,
            Booking.status == BookingStatus.completed,
            Booking.created_at >= today_start,
        )
    )
    today_earnings = today_res.scalar() or 0

    # 3. Success Rate
    assigned_count_res = await db.execute(select(func.count(Booking.id)).filter(Booking.technician_id == tech_id))
    assigned_count = assigned_count_res.scalar() or 0

    completed_count_res = await db.execute(
        select(func.count(Booking.id)).filter(
            Booking.technician_id == tech_id, Booking.status == BookingStatus.completed
        )
    )
    completed_count = completed_count_res.scalar() or 0

    success_rate = 100.0 if assigned_count == 0 else (completed_count / assigned_count) * 100

    return {
        "today_earnings": float(today_earnings) / 100,
        "total_earnings": float(total_earnings) / 100,
        "success_rate": round(success_rate, 1),
        "queue_time_mins": 12,  # Still simulated based on fleet avg
        "total_jobs": assigned_count,
    }


@router.get("/me/jobs", response_model=List[BookingResponse])
async def get_my_jobs(
    current_user: dict = Depends(require_role(["technician"])),
    db: AsyncSession = Depends(get_db),
):
    # Use technician_id from token if present, otherwise fetch from DB
    tech_id = current_user.get("technician_id")
    if not tech_id:
        tech_res = await db.execute(select(Technician).filter(Technician.user_id == current_user["sub"]))
        tech = tech_res.scalar_one_or_none()
        if not tech:
            raise HTTPException(status_code=404, detail="Technician profile not found")
        tech_id = tech.id

    # Fetch assigned jobs
    query = (
        select(Booking)
        .filter(
            Booking.technician_id == tech_id,
            Booking.status.in_(
                [
                    BookingStatus.assigned,
                    BookingStatus.on_the_way,
                    BookingStatus.arrived,
                    BookingStatus.sample_collected,
                ]
            ),
        )
        .order_by(Booking.scheduled_at.asc())
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/jobs/available", response_model=List[BookingResponse])
async def get_available_jobs(
    current_user: dict = Depends(require_role(["technician"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists jobs that are confirmed but not yet assigned to any technician.
    """
    query = (
        select(Booking)
        .filter(Booking.status == BookingStatus.confirmed, Booking.technician_id == None)
        .order_by(Booking.scheduled_at.asc())
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/bookings/{booking_id}/assign")
async def self_assign_job(
    booking_id: str,
    current_user: dict = Depends(require_role(["technician"])),
    db: AsyncSession = Depends(get_db),
):
    tech_id = current_user.get("technician_id")
    if not tech_id:
        tech_res = await db.execute(select(Technician).filter(Technician.user_id == current_user["sub"]))
        tech = tech_res.scalar_one_or_none()
        if not tech:
            raise HTTPException(status_code=404, detail="Technician profile not found")
        tech_id = tech.id

    res = await db.execute(select(Booking).filter(Booking.id == booking_id))
    booking = res.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.tech_id:
        raise HTTPException(status_code=400, detail="Job already assigned")

    booking.tech_id = tech_id
    booking.status = BookingStatus.assigned

    await db.commit()
    return {"message": "Job assigned successfully", "status": booking.status}


@router.patch("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: BookingStatus,
    current_user: dict = Depends(require_role(["technician"])),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Booking).filter(Booking.id == booking_id))
    booking = res.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Update status
    old_status = booking.status
    booking.status = status

    # Log Activity in MongoDB
    await mongo_service.track_activity(
        user_id=str(current_user["sub"]),
        action="update_booking_status",
        resource="booking",
        resource_id=str(booking.id),
        metadata={"old_status": old_status, "new_status": status},
    )

    await db.commit()
    return {"message": f"Status updated to {status}", "booking_id": booking_id}


@router.post("/bookings/{booking_id}/upload-report")
async def upload_diagnostic_report(
    booking_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role(["technician"])),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Booking).filter(Booking.id == booking_id))
    booking = res.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 1. Upload to Cloudinary Storage
    report_data = await upload_report_to_supabase(file, str(booking.id), str(booking.user_id))

    if not report_data:
        raise HTTPException(status_code=500, detail="Failed to upload report. Please try again.")

    # 2. Update Booking with Report URL and mark as Report Ready
    booking.status = BookingStatus.report_ready

    # 3. Create Notification in MongoDB
    try:
        await mongo_service.create_notification(
            user_id=str(booking.user_id),
            title="Report is Ready!",
            message=f"Your diagnostic report for booking {booking_id} is now available.",
            type="report",
        )
    except Exception as e:
        logger.warning(f"Non-critical: Notification failed for booking {booking_id}: {e}")

    await db.commit()
    return {
        "message": "Report uploaded successfully",
        "report_url": report_data["secure_url"],
        "status": booking.status,
    }


@router.patch("/me/location")
async def update_my_location(
    coords: LocationUpdate,
    current_user: dict = Depends(require_role(["technician"])),
    db: AsyncSession = Depends(get_db),
):
    # Fetch technician
    tech_id = current_user.get("technician_id")
    if not tech_id:
        tech_res = await db.execute(select(Technician).filter(Technician.user_id == current_user["sub"]))
        tech = tech_res.scalar_one_or_none()
        if not tech:
            raise HTTPException(status_code=404, detail="Technician profile not found")
    else:
        tech_res = await db.execute(select(Technician).filter(Technician.id == tech_id))
        tech = tech_res.scalar_one_or_none()

    tech.current_lat = coords.lat
    tech.current_lng = coords.lng

    await db.commit()
    return {"message": "Location updated"}
