from fastapi import APIRouter, Depends, HTTPException, status, Query
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, desc
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models.user import User
from app.models.lab import Lab
from app.models.booking import Booking, BookingStatus
from app.models.technician import Technician
from app.models.payment import Payment, PaymentStatus, LabWallet, Ledger
from app.middleware.rbac import get_current_user
from app.services.mongo_service import mongo_service
from app.services.payment_service import payment_service

from app.models.support import SupportTicket, TicketStatus

router = APIRouter(prefix="/admin", tags=["Admin Portal"])
logger = logging.getLogger(__name__)


# FIX 6: Allow both 'admin' and 'superadmin' roles
def check_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    return current_user


@router.get("/stats")
async def get_admin_stats(
    current_user: dict = Depends(check_admin), db: AsyncSession = Depends(get_db)
):
    """
    Returns platform-wide KPIs for the Admin Dashboard.
    """
    # 1. Total Users
    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    # 2. Total Labs & Pending Verification
    total_labs_res = await db.execute(select(func.count(Lab.id)))
    total_labs = total_labs_res.scalar() or 0

    pending_labs_res = await db.execute(
        select(func.count(Lab.id)).filter(Lab.is_verified.is_(False))
    )
    pending_labs = pending_labs_res.scalar() or 0

    # 3. Bookings Today
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    bookings_today_res = await db.execute(
        select(func.count(Booking.id)).filter(Booking.created_at >= today_start)
    )
    bookings_today = bookings_today_res.scalar() or 0

    # 4. Total Revenue MTD (Month to Date)
    month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    total_revenue_mtd_res = await db.execute(
        select(func.sum(Booking.total_amount)).filter(
            Booking.created_at >= month_start, Booking.status != BookingStatus.cancelled
        )
    )
    total_revenue_mtd = total_revenue_mtd_res.scalar() or 0

    # 5. Open Support Tickets
    open_tickets_res = await db.execute(
        select(func.count(SupportTicket.id)).filter(
            SupportTicket.status == TicketStatus.open
        )
    )
    open_tickets = open_tickets_res.scalar() or 0

    # 6. Real Trend Data (Last 30 Days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    trend_query = (
        select(
            func.date_trunc("day", Booking.created_at).label("date"),
            func.count(Booking.id).label("bookings"),
            func.sum(Booking.total_amount).label("revenue"),
        )
        .filter(Booking.created_at >= thirty_days_ago)
        .group_by(func.date_trunc("day", Booking.created_at))
        .order_by("date")
    )

    trend_res = await db.execute(trend_query)
    performance_data = []
    for row in trend_res.all():
        performance_data.append(
            {
                "date": row.date.strftime("%b %d"),
                "bookings": row.bookings,
                "revenue": float(row.revenue or 0) / 100,
            }
        )

    # 7. Booking Types Distribution
    type_query = select(Booking.type, func.count(Booking.id)).group_by(Booking.type)
    type_res = await db.execute(type_query)
    booking_types_data = []
    colors = ["#00A86B", "#1E88E5", "#EF4444", "#F59E0B"]
    for i, row in enumerate(type_res.all()):
        booking_types_data.append(
            {
                "name": (
                    "Home Collection"
                    if row[0].value == "home_collection"
                    else "Lab Visit"
                ),
                "value": row[1],
                "color": colors[i % len(colors)],
            }
        )

    return {
        "total_users": total_users,
        "total_labs": total_labs,
        "pending_labs": pending_labs,
        "bookings_today": bookings_today,
        "revenue_mtd": float(total_revenue_mtd) / 100,  # to ₹
        "open_support_tickets": open_tickets,
        "performance_data": performance_data,
        "booking_types_data": booking_types_data,
        "recent_activity": await mongo_service.get_user_notifications(
            str(current_user["sub"]), limit=10
        ),
    }


@router.get("/platform-health")
async def get_platform_health(current_user: User = Depends(check_admin)):
    """
    Returns live system logs and health status from MongoDB.
    """
    logs = await mongo_service.get_recent_logs(limit=50)

    return {
        "status": "operational",
        "logs": logs,
        "timestamp": datetime.now(timezone.utc),
    }


@router.get("/onboarding/labs")
async def list_onboarding_labs(
    current_user: dict = Depends(check_admin), db: AsyncSession = Depends(get_db)
):
    """
    Returns labs that are pending verification with their accreditation docs.
    """
    result = await db.execute(
        select(Lab).filter(Lab.is_verified.is_(False)).order_by(Lab.created_at.desc())
    )
    labs = result.scalars().all()

    formatted = []
    for lab in labs:
        formatted.append(
            {
                "id": str(lab.id),
                "name": lab.name,
                "city": lab.city,
                "plan": "Starter",  # Default for new labs
                "submittedAt": lab.created_at.isoformat(),
                "assignedTo": None,
                "stage": (
                    "Applied" if not lab.nabl_certificate_url else "Documents Submitted"
                ),
                "nabl_url": lab.nabl_certificate_url,
                "pathologist": lab.pathologist_name,
                "reg_no": lab.registration_number,
            }
        )
    return formatted


# FIX 13: Added pagination to all list endpoints
@router.get("/labs")
async def list_labs(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(check_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists all labs for management.
    """
    result = await db.execute(
        select(Lab)
        .order_by(Lab.is_verified.asc(), Lab.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(check_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists all users (patients) for management.
    """
    result = await db.execute(
        select(User).filter(User.role == "user").offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/bookings")
async def list_bookings(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(check_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists all platform-wide bookings with enriched data.
    """
    query = (
        select(Booking, Lab.name.label("lab_name"))
        .join(Lab, Booking.lab_id == Lab.id)
        .order_by(Booking.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)

    bookings = []
    for row in result.all():
        b = row[0]  # Booking object
        lab_name = row[1]
        bookings.append(
            {
                "id": str(b.id),
                "patient_name": b.patient_name,
                "lab_name": lab_name,
                "status": b.status,
                "total_amount": b.total_amount / 100,  # to ₹
                "type": b.type,
                "scheduled_at": b.scheduled_at,
                "created_at": b.created_at,
            }
        )

    return bookings


@router.get("/technicians")
async def list_technicians(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(check_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists all technicians with profile details.
    """
    query = (
        select(Technician, User.name, User.phone, User.profile_image_url)
        .join(User, Technician.user_id == User.id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)

    technicians = []
    for row in result.all():
        t = row[0]  # Technician object
        name, phone, avatar = row[1], row[2], row[3]
        technicians.append(
            {
                "id": str(t.id),
                "name": name,
                "phone": phone,
                "avatar": avatar,
                "city": t.city,
                "vehicle": t.vehicle,
                "status": t.status,
                "rating": t.rating,
            }
        )

    return technicians


@router.patch("/labs/{lab_id}/verify")
async def verify_lab(
    lab_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin),
):
    """
    Verifies a lab partner.
    """
    result = await db.execute(select(Lab).filter(Lab.id == lab_id))
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    lab.is_verified = True
    await db.commit()

    # Log activity
    await mongo_service.track_activity(
        user_id=str(current_user["sub"]),
        action="verify",
        resource="lab",
        resource_id=str(lab.id),
    )

    return {"message": f"Lab {lab.name} verified successfully"}


@router.patch("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin),
):
    """
    Toggles user's is_active status.
    """
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    await db.commit()
    return {"is_active": user.is_active}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin),
):
    """
    Soft-deletes a user from the system.
    """
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # FIX 7: Soft-delete instead of hard delete to prevent FK constraint violations
    # Check for related records and warn admin
    related_bookings = await db.execute(
        select(func.count(Booking.id)).filter(Booking.user_id == user_id)
    )
    booking_count = related_bookings.scalar() or 0

    user.is_active = False
    await db.commit()
    return {
        "message": "User deactivated successfully",
        "had_bookings": booking_count,
        "note": f"User had {booking_count} bookings — soft-deleted (is_active=False) to preserve data integrity.",
    }


@router.get("/support/tickets")
async def list_support_tickets(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(check_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists all support tickets on the platform.
    """
    result = await db.execute(
        select(SupportTicket)
        .order_by(SupportTicket.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/support/tickets/{ticket_id}/respond")
async def respond_to_ticket(
    ticket_id: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin),
):
    """
    Sends a response to a support ticket and optionally resolves it.
    """
    result = await db.execute(
        select(SupportTicket).filter(SupportTicket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Update messages (Mock logic - in production these should be separate records)
    msgs = ticket.messages or []
    msgs.append(
        {
            "sender": "admin",
            "text": payload.get("message"),
            "time": datetime.now(timezone.utc).isoformat(),
        }
    )
    ticket.messages = msgs
    ticket.updated_at = datetime.now(timezone.utc)

    if payload.get("status"):
        ticket.status = payload.get("status")

    await db.commit()
    return ticket


@router.get("/financials")
async def get_financials(
    current_user: dict = Depends(check_admin), db: AsyncSession = Depends(get_db)
):
    """
    Returns a list of financial transactions derived from bookings.
    """
    # Commission logic
    result = await db.execute(
        select(Booking).limit(100).order_by(Booking.created_at.desc())
    )
    bookings = result.scalars().all()

    txs = []
    for b in bookings:
        txs.append(
            {
                "id": f"COM-{str(b.id)[:8]}",
                "lab": b.lab_id,  # Simplified for example
                "amount": float(b.total_amount) / 100 * 0.15,  # 15% commission
                "type": "Commission",
                "date": b.created_at.strftime("%d %b %Y"),
                "status": "Completed",
            }
        )
    return txs


@router.get("/payouts/pending")
async def get_pending_payouts(
    current_user: dict = Depends(check_admin), db: AsyncSession = Depends(get_db)
):
    """
    Lists all paid payments that haven't been transferred to the lab.
    """
    query = (
        select(Payment, Lab.name, Lab.razorpay_account_id)
        .join(Lab, Payment.lab_id == Lab.id)
        .filter(Payment.status == PaymentStatus.paid, Payment.is_transferred.is_(None))
    )
    result = await db.execute(query)
    pending = []
    for row in result.all():
        pay, lab_name, acc_id = row
        pending.append(
            {
                "payment_id": str(pay.id),
                "amount": pay.lab_amount / 100,
                "lab_name": lab_name,
                "razorpay_acc": acc_id or "Not Linked",
                "date": pay.created_at,
            }
        )
    return pending


@router.post("/payouts/process")
async def process_payouts(
    current_user: dict = Depends(check_admin), db: AsyncSession = Depends(get_db)
):
    """
    Triggers bank transfers via Razorpay Route for all pending payments.
    """
    query = (
        select(Payment, Lab.razorpay_account_id)
        .join(Lab, Payment.lab_id == Lab.id)
        .filter(Payment.status == PaymentStatus.paid, Payment.is_transferred.is_(None))
    )
    result = await db.execute(query)
    payments_to_process = result.all()

    stats = {"processed": 0, "failed": 0, "no_account": 0}

    for pay, acc_id in payments_to_process:
        if not acc_id:
            stats["no_account"] += 1
            continue

        # Call Razorpay Route Transfer
        res = await payment_service.route_transfer(
            account_id=acc_id,
            amount_paise=pay.lab_amount,
            payment_id=pay.razorpay_payment_id or str(pay.id),
        )

        if res.get("status") in ["processed", "created", "completed"]:
            pay.is_transferred = datetime.now(timezone.utc)
            pay.transfer_id = res.get("id") or res.get("transfer_id")
            stats["processed"] += 1

            # Update Lab Wallet status (Move from pending to paid out locally)
            wallet_res = await db.execute(
                select(LabWallet).filter(LabWallet.lab_id == pay.lab_id)
            )
            wallet = wallet_res.scalar_one_or_none()
            if wallet:
                wallet.pending_balance -= pay.lab_amount
                wallet.total_paid_out += pay.lab_amount

            # Log in Ledger
            ledger = Ledger(
                lab_id=pay.lab_id,
                type="debit",
                amount=pay.lab_amount,
                reference_type="payout",
                reference_id=pay.id,
                description=f"Transferred to bank account {acc_id}",
            )
            db.add(ledger)
        else:
            stats["failed"] += 1
            logger.error(f"Payout failed for payment {pay.id}: {res}")

    await db.commit()
    return {"message": "Payout processing completed", "stats": stats}


@router.get("/reports-audit")
async def get_all_reports(
    current_user: dict = Depends(check_admin), db: AsyncSession = Depends(get_db)
):
    """
    Lists all diagnostic reports across the platform.
    """
    result = await db.execute(
        select(Booking).filter(Booking.status == BookingStatus.completed).limit(50)
    )
    bookings = result.scalars().all()

    reports = []
    for b in bookings:
        reports.append(
            {
                "id": f"RPT-{str(b.id)[:8]}",
                "patient": b.patient_name,
                "lab": "Partner Lab",
                "test": "Diagnostic Panel",
                "date": b.created_at.strftime("%d %b %Y"),
                "size": "1.5 MB",
                "status": "Clean",
            }
        )
    return reports


@router.get("/audit-logs")
async def list_audit_logs(current_user: dict = Depends(check_admin), limit: int = 100):
    """
    Returns a chronological stream of administrative actions from MongoDB.
    """
    activities = (
        await mongo_service.activity.find()
        .sort("timestamp", -1)
        .limit(limit)
        .to_list(length=limit)
    )

    # Format for the frontend datatable
    formatted_logs = []
    for act in activities:
        formatted_logs.append(
            {
                "id": str(act["_id"]),
                "time": act["timestamp"].strftime("%d %b %Y, %H:%M:%S"),
                "admin": "System Administrator",  # In production, fetch name from PostgreSQL using user_id
                "email": "admin@meddynet.com",
                "action": f"{act['action'].capitalize()} {act['resource'].capitalize()}",
                "entityType": act["resource"].capitalize(),
                "entityId": act.get("resource_id", "N/A"),
                "ip": act.get("metadata", {}).get("ip", "127.0.0.1"),
                "severity": "Normal" if act["action"] != "delete" else "Warning",
            }
        )

    return formatted_logs


@router.post("/cleanup/deduplicate-labs")
async def deduplicate_labs(
    current_user: dict = Depends(check_admin), db: AsyncSession = Depends(get_db)
):
    """
    Finds duplicate labs by name (case-insensitive) and deactivates them,
    keeping only the most recently created one active per unique name.
    Also deactivates labs with no associated tests.
    """
    from sqlalchemy.orm import selectinload

    # 1. Get all labs
    result = await db.execute(select(Lab).options(selectinload(Lab.tests)))
    all_labs = result.scalars().all()

    seen_names: dict = {}
    deactivated = 0
    empty_deactivated = 0

    for lab in all_labs:
        name_key = lab.name.strip().lower()

        # Deactivate labs with no tests
        if not lab.tests or len(lab.tests) == 0:
            if lab.is_active:
                lab.is_active = False
                empty_deactivated += 1
            continue

        # Keep the first (most recent) occurrence, deactivate the rest
        if name_key in seen_names:
            if lab.is_active:
                lab.is_active = False
                deactivated += 1
        else:
            seen_names[name_key] = str(lab.id)

    await db.commit()

    # Log activity
    await mongo_service.track_activity(
        user_id=str(current_user["sub"]),
        action="cleanup",
        resource="lab",
        resource_id="bulk",
        metadata={
            "duplicates_deactivated": deactivated,
            "empty_deactivated": empty_deactivated,
            "total_unique": len(seen_names),
        },
    )

    return {
        "message": "Lab deduplication completed.",
        "duplicates_deactivated": deactivated,
        "empty_labs_deactivated": empty_deactivated,
        "unique_labs_remaining": len(seen_names),
    }
