import logging
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks

from app.middleware.rbac import get_current_user
from app.tasks.export_tasks import export_bookings_to_csv

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/data-export", tags=["data_export"])

def _check_admin(current_user: dict):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")

@router.post("/bookings")
async def request_bookings_export(
    current_user: dict = Depends(get_current_user),
) -> Dict[str, Any]:
    """Admin - Trigger a background Celery task to export bookings to CSV."""
    _check_admin(current_user)
    
    email = current_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="User email not found for notification")
        
    # Queue celery task
    task = export_bookings_to_csv.delay(email)
    
    logger.info(f"Queued bookings export task {task.id} for {email}")
    
    return {
        "message": "Export task queued successfully. You will be notified when it's ready.",
        "task_id": task.id
    }
