import logging

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary if credentials are provided
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_image_to_cloudinary(file: UploadFile, folder: str = "meddynet/profiles"):
    """
    Uploads an image to Cloudinary and returns the secure URL.
    Used for User profiles, Lab banners, and Technician photos.
    """
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY):
        # Fallback for dev environments without Cloudinary configured
        return "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"

    try:
        contents = await file.read()
        upload_result = cloudinary.uploader.upload(contents, folder=folder, resource_type="auto")
        return upload_result.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary upload failed for folder={folder}: {e}")
        return None
