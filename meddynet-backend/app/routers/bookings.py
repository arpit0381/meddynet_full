import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware.rbac import get_current_user, require_role
from app.models.booking import Booking, BookingStatus, BookingTest, BookingType
from app.models.lab import Lab, LabTest
from app.models.payment import Payment, PaymentStatus
from app.models.technician import Technician
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, LabQuickScheduleRequest
from app.schemas.technician import TrackingResponse
from app.services.mongo_service import mongo_service
from app.services.notification_service import notification_service
from app.services.payment_service import payment_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["bookings"])


def _serialize_booking(booking, lab=None, test_names=None, payment_status="pending"):
    """Enrich a booking with lab info and test names for frontend consumption."""
    return {
        "id": str(booking.id),
        "user_id": str(booking.user_id),
        "lab_id": str(booking.lab_id),
        "tech_id": str(booking.technician_id) if booking.technician_id else None,
        "type": booking.type.value if booking.type else "home_collection",
        "status": booking.status.value if booking.status else "pending",
        "payment_status": payment_status,
        "scheduled_at": (booking.scheduled_at.isoformat() if booking.scheduled_at else None),
        "address": booking.address,
        "lat": booking.lat,
        "lng": booking.lng,
        "patient_name": booking.patient_name,
        "patient_phone": booking.patient_phone,
        "patient_age": booking.patient_age,
        "patient_gender": booking.patient_gender,
        "total_amount": booking.total_amount,
        "promo_code": booking.promo_code,
        "discount_amount": booking.discount_amount,
        "notes": booking.notes,
        "cancelled_at": (booking.cancelled_at.isoformat() if booking.cancelled_at else None),
        "cancel_reason": booking.cancel_reason,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
        # Enriched fields for frontend
        "lab": (
            {
                "id": str(lab.id),
                "name": lab.name,
                "city": lab.city,
                "address": lab.address,
            }
            if lab
            else None
        ),
        "items": [{"name": n} for n in (test_names or [])],
    }


@router.post("", response_model=BookingResponse)
async def create_booking(
    payload: BookingCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new test booking with automated payment initialization."""

    logger.info(f"Generating booking for user {current_user['sub']} at lab {payload.lab_id}")
    try:
        user_uuid = uuid.UUID(str(current_user["sub"]))
        lab_uuid = uuid.UUID(str(payload.lab_id))

        total_amount = 0
        tests_to_link = []
        for test_id in payload.test_ids:
            res = await db.execute(select(LabTest).filter(LabTest.id == test_id))
            test = res.scalar_one_or_none()
            if not test:
                logger.error(f"Test not found: {test_id}")
                raise HTTPException(status_code=400, detail=f"Test {test_id} not found")
            total_amount += test.price
            tests_to_link.append(test)

        # 2. Create Booking
        new_booking = Booking(
            user_id=user_uuid,
            lab_id=lab_uuid,
            type=payload.type,
            scheduled_at=payload.scheduled_at,
            address=payload.address,
            lat=payload.lat,
            lng=payload.lng,
            patient_name=payload.patient_name,
            patient_phone=payload.patient_phone,
            patient_age=payload.patient_age,
            patient_gender=payload.patient_gender,
            total_amount=total_amount,
            promo_code=payload.promo_code,
            discount_amount=0,
            notes=payload.notes,
            tests=[BookingTest(lab_test_id=test.id, price_at_booking=test.price) for test in tests_to_link],
        )
        db.add(new_booking)
        await db.flush()

        # 3. Initiation Payment
        logger.info(f"Initiating payment of {total_amount} paise")
        order = await payment_service.initiate_payment(total_amount)
        order_id = order.get("order_id") or order.get("id")

        # Calculate Splits
        res_lab = await db.execute(select(Lab).filter(Lab.id == lab_uuid))
        lab_obj = res_lab.scalar_one_or_none()
        commission_rate = lab_obj.commission_rate if lab_obj else 0.15

        commission = int(total_amount * commission_rate)
        lab_payout = total_amount - commission

        # Create Payment Record
        new_payment = Payment(
            booking_id=new_booking.id,
            user_id=user_uuid,
            lab_id=lab_uuid,
            razorpay_order_id=order_id,
            total_amount=total_amount,
            commission_amount=commission,
            lab_amount=lab_payout,
            status=PaymentStatus.pending,
        )
        db.add(new_payment)

        await db.commit()
        logger.info(f"Booking {new_booking.id} committed successfully")

        # 4. Background Notifications
        background_tasks.add_task(
            notification_service.send_booking_confirmation,
            payload.patient_phone,
            str(new_booking.id),
        )
        background_tasks.add_task(
            mongo_service.create_notification,
            user_id=str(user_uuid),
            title="Booking Confirmed!",
            message=f"Your test booking has been confirmed. ID: {str(new_booking.id)[:8]}",
            type="booking-test",
            metadata={"booking_id": str(new_booking.id)},
        )

        # 5. Activity Tracking
        background_tasks.add_task(
            mongo_service.track_activity,
            user_id=str(user_uuid),
            action="create_booking",
            resource="booking",
            resource_id=str(new_booking.id),
            metadata={"lab_id": str(lab_uuid), "amount": total_amount},
        )

        # Prepare result data before commit to ensure relationships are loaded
        test_summaries = [
            {
                "id": str(t.id),
                "lab_test_id": str(t.lab_test_id),
                "price_at_booking": t.price_at_booking,
            }
            for t in new_booking.tests
        ]
        booking_data = {
            "id": str(new_booking.id),
            "user_id": str(new_booking.user_id),
            "lab_id": str(new_booking.lab_id),
            "type": new_booking.type.value,
            "status": new_booking.status.value,
            "scheduled_at": (new_booking.scheduled_at.isoformat() if new_booking.scheduled_at else None),
            "address": new_booking.address,
            "patient_name": new_booking.patient_name,
            "patient_phone": new_booking.patient_phone,
            "patient_age": new_booking.patient_age,
            "patient_gender": new_booking.patient_gender,
            "total_amount": new_booking.total_amount,
            "discount_amount": new_booking.discount_amount,
            "razorpay_order_id": order_id,
            "amount": total_amount,
            "created_at": (new_booking.created_at.isoformat() if new_booking.created_at else None),
            "tests": test_summaries,
        }

        # FIX 3: Removed redundant second db.commit() — first commit on line 139 is sufficient
        return booking_data
    except Exception as e:
        logger.error(f"====== BOOKING ERROR ====== \n{str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Booking creation failed. Please try again.")


@router.post("/lab/quick", response_model=BookingResponse)
async def lab_quick_schedule(
    payload: LabQuickScheduleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Allow labs to manually schedule a visit (walk-in or home collection)."""
    # 1. Verify Lab Identity
    res = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = res.scalar_one_or_none()

    if not user or not user.lab_id:
        raise HTTPException(status_code=403, detail="Only Lab Admins can use quick schedule")

    # 2. Create the Booking
    new_booking = Booking(
        user_id=user.id,  # Lab admin is the registrar
        lab_id=user.lab_id,
        type=payload.type,
        status=BookingStatus.confirmed,  # Manual lab entries are pre-confirmed
        scheduled_at=payload.scheduled_at,
        patient_name=payload.patient_name,
        patient_phone=payload.patient_phone,
        total_amount=0,  # Manual offline payment handling
        notes=payload.notes,
        address="At Lab" if payload.type == BookingType.lab_visit else "Manual Entry",
    )

    db.add(new_booking)

    try:
        await db.commit()
        await db.refresh(new_booking)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save schedule. Please try again.")

    # 3. Track Lab Activity
    try:
        await mongo_service.track_activity(
            user_id=str(user.id),
            action="lab_quick_schedule",
            resource="booking",
            resource_id=str(new_booking.id),
            metadata={"type": payload.type, "patient": payload.patient_name},
        )
    except Exception as e:
        logger.error(f"Failed to track lab activity for booking {new_booking.id}: {e}")

    # 4. Construct safe response to avoid lazy-loading issues
    return {
        "id": new_booking.id,
        "user_id": new_booking.user_id,
        "lab_id": new_booking.lab_id,
        "type": new_booking.type,
        "status": new_booking.status,
        "scheduled_at": new_booking.scheduled_at,
        "patient_name": new_booking.patient_name,
        "patient_phone": new_booking.patient_phone,
        "total_amount": new_booking.total_amount,
        "discount_amount": new_booking.discount_amount,
        "created_at": new_booking.created_at,
        "tests": [],
        "notes": new_booking.notes,
        "address": new_booking.address,
    }


# FIX 13: Added pagination to bookings list
@router.get("")
@router.get("/me")
async def get_my_bookings(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch user bookings with enriched data efficiently."""
    user_id = uuid.UUID(current_user["sub"])

    # 1. Fetch bookings with joined labs and preloaded tests
    result = await db.execute(
        select(Booking, Lab)
        .outerjoin(Lab, Booking.lab_id == Lab.id)
        .options(selectinload(Booking.tests))
        .filter(Booking.user_id == user_id)
        .order_by(Booking.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    rows = result.all()

    # 2. Batch fetch payment statuses
    booking_ids = [b.id for b, _ in rows]
    if booking_ids:
        pay_res = await db.execute(
            select(Payment.booking_id, Payment.status).filter(Payment.booking_id.in_(booking_ids))
        )
        payment_map = {row[0]: row[1].value if hasattr(row[1], "value") else str(row[1]) for row in pay_res.all()}
    else:
        payment_map = {}

    enriched = []

    # Batch fetch ALL test names for all bookings at once (fix N+1 query)
    if booking_ids:
        from app.models.booking import BookingTest

        bt_res = await db.execute(
            select(BookingTest.booking_id, LabTest.name)
            .join(LabTest, BookingTest.lab_test_id == LabTest.id)
            .filter(BookingTest.booking_id.in_(booking_ids))
        )
        test_names_map: dict = {}
        for row in bt_res.all():
            test_names_map.setdefault(row[0], []).append(row[1])
    else:
        test_names_map = {}

    for booking, lab in rows:
        test_names = test_names_map.get(booking.id, [])
        p_status = payment_map.get(booking.id, "pending")
        enriched.append(_serialize_booking(booking, lab, test_names, p_status))

    return enriched


@router.get("/{booking_id}")
async def get_booking_detail(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get optimized single booking with full joined details."""
    b_id = uuid.UUID(booking_id)
    u_id = uuid.UUID(current_user["sub"])

    result = await db.execute(
        select(Booking, Lab)
        .outerjoin(Lab, Booking.lab_id == Lab.id)
        .options(selectinload(Booking.tests))
        .filter(Booking.id == b_id, Booking.user_id == u_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking, lab = row

    test_names = []
    if booking.tests:
        test_ids = [bt.lab_test_id for bt in booking.tests]
        if test_ids:
            t_res = await db.execute(select(LabTest.name).filter(LabTest.id.in_(test_ids)))
            test_names = list(t_res.scalars().all())

    # Fetch Payment Status
    pay_res = await db.execute(select(Payment.status).filter(Payment.booking_id == b_id))
    pay_status_obj = pay_res.scalar_one_or_none()
    p_status = pay_status_obj.value if pay_status_obj and hasattr(pay_status_obj, "value") else "pending"

    return _serialize_booking(booking, lab, test_names, p_status)


@router.patch("/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    payload: Dict[str, str],
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update booking status. Authorized for Lab Admins, Staff, and assigned Technicians."""
    b_id = uuid.UUID(booking_id)
    result = await db.execute(select(Booking).filter(Booking.id == b_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # RBAC Check: Lab Admin/Staff of the same lab OR Assigned Technician
    user_role = current_user.get("role")
    user_lab_id = current_user.get("lab_id")

    is_lab_staff = user_role in ["lab_admin", "lab_staff"] and str(booking.lab_id) == str(user_lab_id)
    is_assigned_tech = user_role == "technician" and str(booking.tech_id) == str(current_user.get("technician_id"))

    if not (is_lab_staff or is_assigned_tech or user_role == "admin"):
        raise HTTPException(status_code=403, detail="Unauthorized to update this booking status")

    new_status_str = payload.get("status")
    if not new_status_str:
        raise HTTPException(status_code=400, detail="Status is required")

    try:
        # Check if the string matches any Enum value (case insensitive)
        booking.status = BookingStatus(new_status_str.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status_str}")

    await db.commit()

    # Log in MongoDB
    try:
        await mongo_service.track_activity(
            user_id=str(current_user["sub"]),
            action="update_status",
            resource="booking",
            resource_id=str(booking.id),
            metadata={"new_status": booking.status.value},
        )
    except Exception as e:
        logger.error(f"Failed to track status update activity for booking {booking.id}: {e}")

    return {"message": "Status updated", "status": booking.status.value}


@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a booking. Only possible if status is pending or confirmed."""
    result = await db.execute(
        select(Booking).filter(
            Booking.id == uuid.UUID(booking_id),
            Booking.user_id == uuid.UUID(current_user["sub"]),
        )
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status not in [BookingStatus.pending, BookingStatus.confirmed]:
        raise HTTPException(status_code=400, detail="Cannot cancel booking in current status")

    booking.status = BookingStatus.cancelled
    booking.cancelled_at = datetime.now(timezone.utc)
    booking.cancel_reason = "Cancelled by patient"

    await db.commit()
    await db.refresh(booking)

    # Create cancellation notification
    await mongo_service.create_notification(
        user_id=str(current_user["sub"]),
        title="Booking Cancelled",
        message=f"Your booking {str(booking.id)[:8]} has been cancelled.",
        type="booking",
        metadata={"booking_id": str(booking.id)},
    )

    return {"message": "Booking cancelled successfully", "id": str(booking.id)}


@router.get("/{booking_id}/tracking", response_model=TrackingResponse)
async def track_phlebotomist(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        b_id = uuid.UUID(booking_id) if isinstance(booking_id, str) else booking_id
        u_id = uuid.UUID(current_user["sub"]) if isinstance(current_user["sub"], str) else current_user["sub"]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    query = (
        select(Booking, Technician)
        .join(Technician, Booking.technician_id == Technician.id)
        .filter(Booking.id == b_id, Booking.user_id == u_id)
    )
    result = await db.execute(query)
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Tracking unavailable for this booking")

    booking, tech = row

    # Only track if phlebotomist is active
    if booking.status not in [BookingStatus.on_the_way, BookingStatus.arrived]:
        return {
            "tech_id": tech.id,
            "tech_name": tech.name,
            "lat": None,
            "lng": None,
            "status": tech.status,
            "booking_status": str(booking.status),
        }

    return {
        "tech_id": tech.id,
        "tech_name": tech.name,
        "lat": tech.current_lat,
        "lng": tech.current_lng,
        "status": tech.status,
        "booking_status": str(booking.status),
    }
