import logging
from app.services.auth_service import supabase, supabase_admin

from fastapi import UploadFile
from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseStorageService:
    def __init__(self):
        self.reports_bucket = "reports"
        self.profiles_bucket = "profiles"

    async def upload_report(self, file: UploadFile, user_id: str, booking_id: str):
        """
        Uploads a PDF report to the 'reports' bucket.
        Path: {user_id}/{booking_id}_{filename}
        Uploads a diagnostic report (PDF) to a private folder.
        """
        file_path = f"reports/{user_id}/{booking_id}_{file.filename}"
        contents = await file.read()

        try:
            # Synchronous call to Supabase Admin SDK
            supabase_admin.storage.from_(self.reports_bucket).upload(
                path=file_path,
                file=contents,
                file_options={"content-type": "application/pdf", "upsert": "true"},
            )

            # Get a signed URL
            # Note: create_signed_url returns a string in newer SDKs, or a dict in older ones.
            res = supabase_admin.storage.from_(self.reports_bucket).create_signed_url(file_path, 315360000)

            # Robustly handle different return types from the SDK
            signed_url = res.get("signedURL") if isinstance(res, dict) else res
            if not signed_url and isinstance(res, dict):
                signed_url = res.get("signed_url")

            return {"path": file_path, "url": signed_url}

        except Exception as e:
            logger.error(f"Supabase report upload failed for user={user_id}, booking={booking_id}: {e}")
            return None

    async def upload_lab_document(self, file: UploadFile, lab_id: str):
        """
        Uploads a lab document (NABL, GST) to the 'reports' bucket under docs/ folder.
        """
        file_path = f"docs/labs/{lab_id}/{file.filename}"
        contents = await file.read()

        try:
            supabase_admin.storage.from_(self.reports_bucket).upload(
                path=file_path, file=contents, file_options={"upsert": "true"}
            )

            # Using get_public_url if 'reports' bucket is public,
            # otherwise signed URL. Reports is usually private.
            res = supabase_admin.storage.from_(self.reports_bucket).create_signed_url(file_path, 315360000)
            signed_url = res.get("signedURL") if isinstance(res, dict) else res

            return {"path": file_path, "url": signed_url}
        except Exception as e:
            logger.error(f"Supabase lab document upload failed for lab={lab_id}: {e}")
            return None

    async def upload_profile_image(self, file: UploadFile, user_id: str):
        """
        Uploads a profile image to the 'profiles' bucket.
        """
        file_path = f"avatars/{user_id}_{file.filename}"
        contents = await file.read()

        try:
            supabase_admin.storage.from_(self.profiles_bucket).upload(
                path=file_path, file=contents, file_options={"upsert": "true"}
            )

            # Profiles are public, so we can just return the public URL
            res = supabase_admin.storage.from_(self.profiles_bucket).get_public_url(file_path)
            public_url = res.get("publicURL") if isinstance(res, dict) else res
            if not public_url and isinstance(res, dict):
                public_url = res.get("public_url")

            return public_url
        except Exception as e:
            logger.error(f"Supabase profile image upload failed for user={user_id}: {e}")
            return None

    async def upload_health_record(self, file: UploadFile, user_id: str):
        """
        Uploads a user's health record (prescription, scan, etc.) to the 'reports' bucket.
        Path: vault/{user_id}/{filename}
        """
        file_path = f"vault/{user_id}/{file.filename}"
        contents = await file.read()

        try:
            supabase_admin.storage.from_(self.reports_bucket).upload(
                path=file_path, file=contents, file_options={"upsert": "true"}
            )

            # Get a long-term signed URL (10 years)
            res = supabase_admin.storage.from_(self.reports_bucket).create_signed_url(file_path, 315360000)
            signed_url = res.get("signedURL") if isinstance(res, dict) else res
            if not signed_url and isinstance(res, dict):
                signed_url = res.get("signed_url")

            return {"path": file_path, "url": signed_url}
        except Exception as e:
            logger.error(f"Supabase health record upload failed for user={user_id}: {e}")
            return None


storage_service = SupabaseStorageService()
