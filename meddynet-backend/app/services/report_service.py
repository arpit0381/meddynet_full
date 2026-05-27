from fastapi import UploadFile
from app.services.supabase_storage_service import storage_service
import logging

logger = logging.getLogger(__name__)

async def upload_report_to_supabase(file: UploadFile, booking_id: str, user_id: str):
    """
    Uploads a diagnostic report (PDF) to Supabase Storage.
    """
    try:
        # Use the finalized Supabase Storage service
        result = await storage_service.upload_report(file, user_id, booking_id)
        
        if not result:
            raise Exception("Failed to upload to Supabase Storage")

        return {
            "secure_url": result["url"],
            "file_path": result["path"],
            "bytes": 0 # Handled in storage layer if needed
        }
    except Exception as e:
        logger.error(f"Report Upload Error: {e}")
        # Return none or fallback if needed, but for production we want a failure if storage is down
        return None


