import json
import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.health_record import HealthRecord
from app.services.supabase_storage_service import storage_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health-records", tags=["health-records"])


@router.post("/upload")
async def upload_health_record(
    title: str = Form(...),
    record_type: str = Form("prescription"),
    doctor_name: Optional[str] = Form(None),
    hospital_name: Optional[str] = Form(None),
    metadata_json: Optional[str] = Form(None),  # JSON string
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = user["sub"]

    # Upload to Supabase
    upload_result = await storage_service.upload_health_record(file, user_id)
    if not upload_result:
        raise HTTPException(status_code=500, detail="Failed to upload file")

    parsed_metadata = {}
    if metadata_json:
        try:
            parsed_metadata = json.loads(metadata_json)
        except json.JSONDecodeError as e:
            logger.warning(f"Invalid metadata_json for health record upload: {e}")

    new_record = HealthRecord(
        user_id=uuid.UUID(user_id),
        title=title,
        record_type=record_type,
        file_url=upload_result["url"],
        file_path=upload_result["path"],
        file_size_bytes=file.size if hasattr(file, "size") else 0,
        doctor_name=doctor_name,
        hospital_name=hospital_name,
        metadata_json=parsed_metadata,
    )

    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)

    # Return serializable dict
    return {
        "id": str(new_record.id),
        "title": new_record.title,
        "record_type": new_record.record_type,
        "file_url": new_record.file_url,
        "doctor_name": new_record.doctor_name,
        "hospital_name": new_record.hospital_name,
        "created_at": new_record.created_at.isoformat(),
        "metadata": new_record.metadata_json,
    }


@router.get("")
async def get_my_records(db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    user_id = uuid.UUID(user["sub"])
    result = await db.execute(
        select(HealthRecord).filter(HealthRecord.user_id == user_id).order_by(HealthRecord.created_at.desc())
    )
    records = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "title": r.title,
            "record_type": r.record_type,
            "file_url": r.file_url,
            "doctor_name": r.doctor_name,
            "hospital_name": r.hospital_name,
            "created_at": r.created_at.isoformat(),
            "metadata": r.metadata_json,
        }
        for r in records
    ]


@router.delete("/{record_id}")
async def delete_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = uuid.UUID(user["sub"])
    result = await db.execute(
        select(HealthRecord).filter(HealthRecord.id == uuid.UUID(record_id), HealthRecord.user_id == user_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    await db.delete(record)
    await db.commit()
    return {"status": "success", "message": "Record deleted"}
