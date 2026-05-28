import logging
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ConfigDict, BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.master_test import MasterTest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/master-tests", tags=["master_tests"])

class MasterTestCreate(BaseModel):
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=200)
    category: str | None = Field(None, max_length=100)
    description: str | None = None

class MasterTestUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    category: str | None = Field(None, max_length=100)
    description: str | None = None
    is_active: bool | None = None

class MasterTestResponse(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    category: str | None
    description: str | None
    is_active: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)

def _check_admin(current_user: dict):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("", response_model=List[MasterTestResponse])
async def list_master_tests(
    skip: int = 0,
    limit: int = Query(default=100, le=500),
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = select(MasterTest)
    if active_only:
        query = query.filter(MasterTest.is_active == True)
    query = query.order_by(MasterTest.name.asc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    tests = result.scalars().all()
    
    return [
        MasterTestResponse(
            id=t.id,
            code=t.code,
            name=t.name,
            category=t.category,
            description=t.description,
            is_active=t.is_active,
            created_at=t.created_at.isoformat() if t.created_at else ""
        ) for t in tests
    ]

@router.post("", response_model=MasterTestResponse, status_code=201)
async def create_master_test(
    payload: MasterTestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    _check_admin(current_user)
    
    dup = await db.execute(select(MasterTest).filter(MasterTest.code == payload.code))
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Test with code {payload.code} already exists")

    test = MasterTest(**payload.model_dump())
    db.add(test)
    await db.commit()
    await db.refresh(test)
    
    return MasterTestResponse(
        id=test.id,
        code=test.code,
        name=test.name,
        category=test.category,
        description=test.description,
        is_active=test.is_active,
        created_at=test.created_at.isoformat() if test.created_at else ""
    )

@router.patch("/{test_id}", response_model=MasterTestResponse)
async def update_master_test(
    test_id: str,
    payload: MasterTestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    _check_admin(current_user)
    
    result = await db.execute(select(MasterTest).filter(MasterTest.id == uuid.UUID(test_id)))
    test = result.scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(test, field, value)

    await db.commit()
    await db.refresh(test)
    
    return MasterTestResponse(
        id=test.id,
        code=test.code,
        name=test.name,
        category=test.category,
        description=test.description,
        is_active=test.is_active,
        created_at=test.created_at.isoformat() if test.created_at else ""
    )
