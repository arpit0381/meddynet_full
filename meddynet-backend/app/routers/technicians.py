import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.schemas.technician import TechnicianResponse, TechnicianCreate
from app.models.technician import Technician, TechnicianStatus
from app.middleware.rbac import require_role

router = APIRouter(prefix="/technicians", tags=["technicians"])
logger = logging.getLogger(__name__)


@router.get("", response_model=List[TechnicianResponse])
async def list_technicians(
    lab_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_role("superadmin")),  # Strict validation in production
):
    query = select(Technician).filter(Technician.is_active == True)
    if lab_id:
        query = query.filter(Technician.lab_id == lab_id)

    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{tech_id}/duty", response_model=TechnicianResponse)
async def update_duty_status(
    tech_id: str,
    status: TechnicianStatus,
    db: AsyncSession = Depends(get_db),
    tech=Depends(require_role("technician")),
):
    result = await db.execute(select(Technician).filter(Technician.id == tech_id))
    technician = result.scalar_one_or_none()
    if not technician:
        raise HTTPException(status_code=404, detail="Technician not found")

    technician.status = status
    await db.commit()
    await db.refresh(technician)
    return technician
