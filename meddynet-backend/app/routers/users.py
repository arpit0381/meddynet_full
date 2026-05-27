import logging
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.schemas.user import UserResponse, UserBase
from app.models.user import User
from app.middleware.rbac import get_current_user
from app.services.cloudinary_service import upload_image_to_cloudinary

router = APIRouter(prefix="/users", tags=["users"])
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(payload: UserBase, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Pydantic v2: use model_dump with exclude_unset to only update fields that were actually sent
    update_data = payload.model_dump(exclude_unset=True)
    # Also filter out None values so we don't wipe existing data
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    for key, value in update_data.items():
        setattr(user, key, value)
    
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/me/avatar")
async def upload_my_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    url = await upload_image_to_cloudinary(file, folder="meddynet/profiles")
    if not url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
        
    res = await db.execute(select(User).filter(User.id == uuid.UUID(current_user["sub"])))
    user = res.scalar_one_or_none()
    if user:
        user.profile_image_url = url
        await db.commit()
    
    return {"status": "success", "url": url}
