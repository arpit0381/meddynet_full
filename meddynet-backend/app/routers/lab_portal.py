from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Dict, Optional
import uuid

from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus, LabWallet, Ledger
from app.models.lab import Lab, LabTest
from app.models.technician import Technician, ShiftType, TechnicianStatus
from app.models.user import User
from app.middleware.rbac import get_current_user, require_role
from app.schemas.booking import BookingResponse
from app.services.auth_service import get_password_hash
from pydantic import BaseModel

class LabUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None
    registration_number: Optional[str] = None
    lab_category: Optional[str] = None
    pathologist_name: Optional[str] = None
    pathologist_reg_no: Optional[str] = None
    operating_hours: Optional[List[Dict]] = None
    facilities: Optional[List[str]] = None
    accreditations: Optional[List[str]] = None

router = APIRouter(tags=["lab-portal"])

async def get_current_lab_id(current_user: dict = Depends(require_role(["lab_admin", "lab_staff"]))) -> uuid.UUID:
    lab_id_str = current_user.get("lab_id")
    if not lab_id_str:
        raise HTTPException(status_code=403, detail="User not associated with any lab")
    try:
        return uuid.UUID(lab_id_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lab ID format in context")

@router.get("/labs/me")
@router.get("/labs/me/")
async def get_my_lab(
    lab_id: str = Depends(get_current_lab_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Lab).filter(Lab.id == lab_id))
    lab = res.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab

@router.patch("/labs/me")
@router.patch("/labs/me/")
async def update_my_lab(
    data: LabUpdate,
    lab_id: str = Depends(get_current_lab_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Lab).filter(Lab.id == lab_id))
    lab = res.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lab, field, value)
        
    await db.commit()
    return {"message": "Profile updated successfully", "lab": lab}

@router.get("/labs/me/stats")
async def get_lab_stats(
    lab_id: str = Depends(get_current_lab_id), 
    db: AsyncSession = Depends(get_db)
):
    # 1. Get Lab 
    lab_res = await db.execute(select(Lab).filter(Lab.id == lab_id))
    lab = lab_res.scalar_one_or_none()
    
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    # 2. Calculate Revenue (Sum of paid payments)
    revenue_res = await db.execute(
        select(func.sum(Payment.lab_amount)).filter(
            Payment.lab_id == lab.id,
            Payment.status == PaymentStatus.paid
        )
    )
    total_revenue = revenue_res.scalar() or 0

    # 3. Total Bookings
    bookings_count_res = await db.execute(
        select(func.count(Booking.id)).filter(Booking.lab_id == lab.id)
    )
    total_bookings = bookings_count_res.scalar() or 0

    # 4. New Patients (Unique users)
    patients_count_res = await db.execute(
        select(func.count(func.distinct(Booking.user_id))).filter(Booking.user_id != None, Booking.lab_id == lab.id)
    )
    total_patients = patients_count_res.scalar() or 0

    # 5. Popular Tests (Group by name and count)
    from app.models.booking import BookingTest
    popular_res = await db.execute(
        select(LabTest.name, func.count(BookingTest.id))
        .join(BookingTest, LabTest.id == BookingTest.lab_test_id)
        .filter(LabTest.lab_id == lab_id)
        .group_by(LabTest.name)
        .order_by(func.count(BookingTest.id).desc())
        .limit(4)
    )
    popular_tests = [{"name": r[0], "value": r[1]} for r in popular_res.all()]
    if not popular_tests:
        popular_tests = [{"name": "No Tests Yet", "value": 0}]
    else:
        # turn counts into percentages for UI
        total_p = sum(p["value"] for p in popular_tests) or 1
        for p in popular_tests:
            p["value"] = int((p["value"] / total_p) * 100)

    # 6. Fleet Stats
    tech_count_res = await db.execute(select(func.count(Technician.id)).filter(Technician.lab_id == lab_id))
    total_techs = tech_count_res.scalar() or 0
    active_tech_count_res = await db.execute(select(func.count(Technician.id)).filter(Technician.lab_id == lab_id, Technician.status == TechnicianStatus.on_duty))
    active_techs = active_tech_count_res.scalar() or 0

    # 7. Active Tests Count
    tests_count_res = await db.execute(select(func.count(LabTest.id)).filter(LabTest.lab_id == lab_id))
    active_tests = tests_count_res.scalar() or 0

    return {
        "lab_name": lab.name,
        "popular_tests": popular_tests,
        "fleet": {
            "total": total_techs,
            "active": active_techs
        },
        "stats": [
            {"label": "Total Revenue", "value": f"₹{total_revenue / 100:,.2f}", "icon": "TrendingUp", "delta": "0%", "color": "bg-emerald-500"},
            {"label": "Total Bookings", "value": str(total_bookings), "icon": "ClipboardCheck", "delta": "0%", "color": "bg-blue-500"},
            {"label": "Total Patients", "value": str(total_patients), "icon": "Users", "delta": "New", "color": "bg-indigo-500"},
            {"label": "Active Catalog", "value": str(active_tests), "icon": "Activity", "delta": "Live", "color": "bg-amber-500"},
        ]
    }

@router.get("/labs/me/earnings")
async def get_lab_earnings(
    lab_id: str = Depends(get_current_lab_id),
    db: AsyncSession = Depends(get_db)
):
    wallet_res = await db.execute(select(LabWallet).filter(LabWallet.lab_id == lab_id))
    wallet = wallet_res.scalar_one_or_none()
    
    ledger_res = await db.execute(
        select(Ledger).filter(Ledger.lab_id == lab_id).order_by(Ledger.created_at.desc()).limit(20)
    )
    ledger = ledger_res.scalars().all()
    
    return {
        "wallet": {
            "balance": wallet.pending_balance if wallet and wallet.pending_balance else 0,
            "pending_balance": wallet.pending_balance if wallet and wallet.pending_balance else 0,
            "pending_payout": wallet.pending_balance if wallet and wallet.pending_balance else 0,
            "total_earned": wallet.total_earned if wallet and wallet.total_earned else 0,
            "total_paid_out": wallet.total_paid_out if wallet and wallet.total_paid_out else 0,
        },
        "ledger": ledger if ledger else []
    }

@router.get("/labs/me/bookings")
async def get_lab_bookings(
    lab_id: uuid.UUID = Depends(get_current_lab_id), 
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    from app.models.booking import BookingTest
    from app.models.report import Report

    # Single query: all bookings for this lab
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.tests))
        .filter(Booking.lab_id == lab_id)
        .order_by(Booking.created_at.desc())
    )
    bookings = result.scalars().all()

    if not bookings:
        return []

    booking_ids = [b.id for b in bookings]

    # Batch fetch: all LabTest names linked to these bookings (1 query)
    bt_res = await db.execute(
        select(BookingTest.booking_id, LabTest.name)
        .join(LabTest, BookingTest.lab_test_id == LabTest.id)
        .filter(BookingTest.booking_id.in_(booking_ids))
    )
    test_names_map: dict = {}
    for row in bt_res.all():
        test_names_map.setdefault(row[0], []).append(row[1])

    # Batch fetch: all payment statuses for these bookings
    pay_res = await db.execute(
        select(Payment.booking_id, Payment.status)
        .filter(Payment.booking_id.in_(booking_ids))
    )
    payment_map = {row[0]: row[1].value if hasattr(row[1], 'value') else str(row[1]) for row in pay_res.all()}

    # Batch fetch: all reports for these bookings
    report_res = await db.execute(
        select(Report.booking_id, Report.id)
        .filter(Report.booking_id.in_(booking_ids))
    )
    report_map = {row[0]: str(row[1]) for row in report_res.all()}

    # Build response in Python (no more per-booking DB hits)
    enriched = []
    for booking in bookings:
        test_names = test_names_map.get(booking.id, [])
        b_type = getattr(booking.type, 'value', str(booking.type)) if booking.type else "home_collection"
        b_status = getattr(booking.status, 'value', str(booking.status)) if booking.status else "pending"
        p_status = payment_map.get(booking.id, "pending")

        enriched.append({
            "id": str(booking.id),
            "user_id": str(booking.user_id),
            "patient_name": booking.patient_name,
            "patient_phone": booking.patient_phone,
            "patient_age": booking.patient_age,
            "patient_gender": booking.patient_gender,
            "type": b_type,
            "status": b_status,
            "payment_status": p_status,
            "scheduled_at": booking.scheduled_at.isoformat() if booking.scheduled_at else None,
            "address": booking.address,
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
            "total_amount": booking.total_amount,
            "test_name": " + ".join(test_names) if test_names else "Diagnostic Test",
            "report_id": report_map.get(booking.id),
            "items": [{"name": n} for n in test_names],
        })

    return enriched


@router.patch("/labs/me/bookings/{booking_id}/assign")
async def assign_technician_to_booking(
    booking_id: uuid.UUID,
    tech_id: uuid.UUID,
    lab_id: uuid.UUID = Depends(get_current_lab_id),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch Booking and verify it belongs to this lab
    res_b = await db.execute(select(Booking).filter(Booking.id == booking_id, Booking.lab_id == lab_id))
    booking = res_b.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found for this lab")
    
    # 2. Fetch Technician and verify they belong to this lab
    res_t = await db.execute(select(Technician).filter(Technician.id == tech_id, Technician.lab_id == lab_id))
    tech = res_t.scalar_one_or_none()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found for this lab")
    
    # 3. Assign and update status
    booking.tech_id = tech_id
    booking.status = BookingStatus.assigned
    
    await db.commit()
    
    # 4. Notify patient
    try:
        from app.services.mongo_service import mongo_service
        await mongo_service.create_notification(
            user_id=str(booking.user_id),
            title="Phlebotomist Assigned 🧑\u200d⚕️",
            message=f"{tech.name} has been assigned to your booking. They will reach out soon.",
            type="booking",
            metadata={"booking_id": str(booking_id), "tech_name": tech.name}
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to create notification for booking {booking_id}: {e}")    
    return {"message": "Technician assigned successfully", "tech_name": tech.name}

@router.get("/labs/me/tests")
async def get_lab_tests(
    lab_id: str = Depends(get_current_lab_id), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LabTest).filter(LabTest.lab_id == lab_id))
    return result.scalars().all()

class TestCreate(BaseModel):
    name: str
    category: str
    price: float
    mrp: float
    turnaround_hours: int = 24
    home_collection: bool = True

class TechCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    vehicle: Optional[str] = None
    shift: str = "morning"
    password: Optional[str] = None

@router.get("/labs/me/technicians")
async def get_lab_technicians(
    lab_id: uuid.UUID = Depends(get_current_lab_id), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Technician).filter(Technician.lab_id == lab_id))
    return result.scalars().all()

@router.post("/labs/me/technicians")
async def onboard_technician(
    data: TechCreate, 
    lab_id: uuid.UUID = Depends(get_current_lab_id), 
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(User).filter(User.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    tech_uid = uuid.uuid4()
    new_user = User(
        id=tech_uid,
        name=data.name,
        phone=data.phone,
        email=data.email,
        role="technician",
        hashed_password=get_password_hash(data.password if data.password else __import__('secrets').token_urlsafe(12)),
        lab_id=lab_id,
        is_active=True
    )
    db.add(new_user)
    await db.flush()
    
    new_tech = Technician(
        id=uuid.uuid4(),
        user_id=new_user.id,
        lab_id=lab_id,
        name=data.name,
        phone=data.phone,
        vehicle=data.vehicle,
        shift=getattr(ShiftType, data.shift, ShiftType.morning),
        status=TechnicianStatus.off_duty
    )
    db.add(new_tech)
    
    await db.commit()
    return {"message": "Technician onboarded successfully", "tech_id": str(new_tech.id)}

@router.post("/labs/me/tests")
async def add_lab_test(
    test_data: TestCreate, 
    lab_id: str = Depends(get_current_lab_id), 
    db: AsyncSession = Depends(get_db)
):
    new_test = LabTest(
        lab_id=lab_id,
        name=test_data.name,
        category=test_data.category,
        price=int(test_data.price * 100),
        mrp=int(test_data.mrp * 100),
        turnaround_hours=test_data.turnaround_hours,
        home_collection=test_data.home_collection
    )
    db.add(new_test)
    await db.commit()
    return {"message": "Test added successfully"}

@router.patch("/labs/me/tests/{test_id}/toggle")
async def toggle_test_status(
    test_id: str, 
    lab_id: str = Depends(get_current_lab_id), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LabTest).filter(LabTest.id == test_id, LabTest.lab_id == lab_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test.is_active = not test.is_active
    await db.commit()
    return {"is_active": test.is_active}

@router.patch("/labs/me/technicians/{tech_id}/toggle")
async def toggle_tech_status(
    tech_id: str,
    lab_id: str = Depends(get_current_lab_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Technician).filter(Technician.id == tech_id, Technician.lab_id == lab_id))
    tech = result.scalar_one_or_none()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    
    tech.status = TechnicianStatus.off_duty if tech.status == TechnicianStatus.on_duty else TechnicianStatus.on_duty
    await db.commit()
    return {"status": tech.status.value}

class BankAccountUpdate(BaseModel):
    razorpay_account_id: str

@router.patch("/labs/me/bank-account")
async def update_bank_account(
    data: BankAccountUpdate,
    lab_id: str = Depends(get_current_lab_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Lab).filter(Lab.id == lab_id))
    lab = res.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
        
    lab.razorpay_account_id = data.razorpay_account_id
    await db.commit()
    return {"message": "Bank account linked successfully", "account_id": lab.razorpay_account_id}
