import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.database import get_db
from app.schemas.report import ReportResponse
from app.models.report import Report
from app.models.booking import Booking, BookingTest
from app.models.lab import Lab, LabTest
from app.middleware.rbac import require_role, get_current_user
from app.services.report_service import upload_report_to_supabase
from app.services.mongo_service import mongo_service

router = APIRouter(prefix="/reports", tags=["reports"])
logger = logging.getLogger(__name__)

@router.post("")
async def upload_report(
    booking_id: uuid.UUID = Form(...),
    report_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(["lab_admin", "lab_staff"])) 
):
    res = await db.execute(select(Booking).filter(Booking.id == booking_id))
    booking = res.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    upload_result = await upload_report_to_supabase(report_file, str(booking_id), str(booking.user_id))
    if not upload_result:
        raise HTTPException(status_code=500, detail="Failed to upload report file to storage")
    
    new_report = Report(
        booking_id=booking_id,
        lab_id=booking.lab_id,
        cloud_url=upload_result["secure_url"],
        cloud_path=upload_result["file_path"],
        file_size_bytes=upload_result["bytes"],
        is_abnormal=False
    )
    
    # Update Booking Status
    from app.models.booking import BookingStatus
    booking.status = BookingStatus.report_ready
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    # Get User for Preferences check
    from app.models.user import User
    res_user = await db.execute(select(User).filter(User.id == booking.user_id))
    patient = res_user.scalar_one_or_none()

    # Create notification for patient
    await mongo_service.create_notification(
        user_id=str(booking.user_id),
        title="Report Ready 📋",
        message="Your test report is now available. Tap to view and download.",
        type="report",
        metadata={"report_id": str(new_report.id), "booking_id": str(booking_id)}
    )

    # Automatically send on WhatsApp if preference is enabled
    if patient and patient.preferences and patient.preferences.get("whatsapp"):
        from app.services.notification_service import notification_service
        await notification_service.send_whatsapp_report(
            phone=patient.phone,
            booking_id=str(booking_id),
            link=new_report.cloud_url
        )

    return new_report


@router.get("")
@router.get("/me")
async def get_my_reports(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Fetch all reports for the logged-in user with enriched lab and test info."""
    result = await db.execute(
        select(Report).join(Booking).filter(Booking.user_id == uuid.UUID(current_user["sub"])).order_by(Report.uploaded_at.desc())
    )
    reports = result.scalars().all()
    
    if not reports:
        return []
    
    # Batch fetch all labs
    lab_ids = list(set(r.lab_id for r in reports))
    lab_res = await db.execute(select(Lab).filter(Lab.id.in_(lab_ids)))
    labs_map = {lab.id: lab for lab in lab_res.scalars().all()}
    
    # Batch fetch all test names via booking_tests
    booking_ids = list(set(r.booking_id for r in reports))
    bt_res = await db.execute(
        select(BookingTest.booking_id, LabTest.name)
        .join(LabTest, BookingTest.lab_test_id == LabTest.id)
        .filter(BookingTest.booking_id.in_(booking_ids))
    )
    test_names_map: dict = {}
    for row in bt_res.all():
        test_names_map.setdefault(row[0], []).append(row[1])
    
    enriched = []
    for r in reports:
        lab = labs_map.get(r.lab_id)
        test_names = test_names_map.get(r.booking_id, [])
        
        enriched.append({
            "id": str(r.id),
            "booking_id": str(r.booking_id),
            "lab_id": str(r.lab_id),
            "cloud_url": r.cloud_url,
            "file_size_bytes": r.file_size_bytes,
            "is_abnormal": r.is_abnormal,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
            "notified_at": r.notified_at.isoformat() if r.notified_at else None,
            "status": "Ready",
            # Enriched fields
            "lab": {
                "id": str(lab.id),
                "name": lab.name,
            } if lab else None,
            "test_name": " + ".join(test_names) if test_names else "Diagnostic Test",
        })
    
    return enriched


@router.get("/{report_id}")
async def get_report_detail(report_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get a single report detail."""
    result = await db.execute(
        select(Report).join(Booking).filter(
            Report.id == uuid.UUID(report_id),
            Booking.user_id == uuid.UUID(current_user["sub"])
        )
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    
    lab_res = await db.execute(select(Lab).filter(Lab.id == r.lab_id))
    lab = lab_res.scalar_one_or_none()
    
    booking_res = await db.execute(select(Booking).filter(Booking.id == r.booking_id))
    booking = booking_res.scalar_one_or_none()
    
    test_names = []
    if booking:
        bt_res = await db.execute(select(BookingTest).filter(BookingTest.booking_id == booking.id))
        booking_tests = bt_res.scalars().all()
        if booking_tests:
            test_ids = [bt.lab_test_id for bt in booking_tests]
            t_res = await db.execute(select(LabTest.name).filter(LabTest.id.in_(test_ids)))
            test_names = list(t_res.scalars().all())
    
    return {
        "id": str(r.id),
        "booking_id": str(r.booking_id),
        "lab_id": str(r.lab_id),
        "cloud_url": r.cloud_url,
        "file_size_bytes": r.file_size_bytes,
        "is_abnormal": r.is_abnormal,
        "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
        "notified_at": r.notified_at.isoformat() if r.notified_at else None,
        "status": "Ready",
        "lab": {
            "id": str(lab.id),
            "name": lab.name,
        } if lab else None,
        "test_name": " + ".join(test_names) if test_names else "Diagnostic Test",
    }
