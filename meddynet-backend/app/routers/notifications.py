import logging
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from app.services.mongo_service import mongo_service
from app.middleware.rbac import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])
logger = logging.getLogger(__name__)

@router.get("")
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    """Fetch user's notifications from MongoDB."""
    user_id = str(current_user["sub"])
    notifications = await mongo_service.get_user_notifications(user_id, limit=30)
    
    # Serialize ObjectId for JSON response
    result = []
    for n in notifications:
        result.append({
            "id": str(n["_id"]),
            "title": n.get("title", ""),
            "message": n.get("message", ""),
            "type": n.get("type", "info"),
            "is_read": n.get("is_read", False),
            "metadata": n.get("metadata", {}),
            "created_at": n.get("created_at", "").isoformat() if n.get("created_at") else None
        })
    return result

@router.patch("/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a single notification as read."""
    await mongo_service.mark_notification_as_read(notification_id)
    return {"message": "Notification marked as read"}

@router.patch("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all user notifications as read."""
    user_id = str(current_user["sub"])
    await mongo_service.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}
