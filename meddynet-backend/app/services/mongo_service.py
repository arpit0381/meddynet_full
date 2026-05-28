import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import certifi
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

logger = logging.getLogger(__name__)


class MongoService:
    def __init__(self):
        self._client = None
        self._db = None

    @property
    def client(self):
        if self._client is None:
            logger.info("Initializing lazy MongoDB connection...")
            is_cloud = "mongodb+srv" in settings.MONGODB_URL
            kwargs = {
                "serverSelectionTimeoutMS": 15000,
                "connectTimeoutMS": 20000,
                "retryWrites": True,
            }
            if is_cloud:
                kwargs["tls"] = True
                kwargs["tlsCAFile"] = certifi.where()
                kwargs["tlsAllowInvalidCertificates"] = True

            self._client = AsyncIOMotorClient(settings.MONGODB_URL, **kwargs)
        return self._client

    @property
    def db(self):
        if self._db is None:
            self._db = self.client[settings.MONGODB_DB_NAME]
        return self._db

    @property
    def notifications(self):
        return self.db.notifications

    @property
    def logs(self):
        return self.db.logs

    @property
    def activity(self):
        return self.db.activity

    @property
    def analytics(self):
        return self.db.analytics

    async def initialize_indexes(self):
        """
        Creates indexes for MongoDB collections to ensure performance.
        """
        try:
            # Notifications: Quick lookup by user_id
            await self.notifications.create_index([("user_id", 1), ("created_at", -1)])
            # Activity: Quick lookup by user_id and resource
            await self.activity.create_index([("user_id", 1), ("action", 1)])
            # Logs: Quick lookup by timestamp
            await self.logs.create_index([("timestamp", -1)])
            logger.info("MongoDB indexes initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize MongoDB indexes: {e}")

    # --- Notifications ---
    async def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        type: str = "info",
        metadata: Dict[str, Any] = None,
    ):
        try:
            notification = {
                "user_id": user_id,
                "title": title,
                "message": message,
                "type": type,
                "metadata": metadata or {},
                "is_read": False,
                "created_at": datetime.now(timezone.utc),
            }
            result = await self.notifications.insert_one(notification)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to create notification: {e}")
            return None

    async def get_user_notifications(self, user_id: str, limit: int = 20):
        try:
            cursor = self.notifications.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
            return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"Failed to fetch notifications (MongoDB might be blocked): {e}")
            return []

    async def mark_notification_as_read(self, notification_id: str):
        from bson import ObjectId

        await self.notifications.update_one({"_id": ObjectId(notification_id)}, {"$set": {"is_read": True}})

    # --- Logs ---
    async def log_event(self, level: str, event: str, message: str, context: Dict[str, Any] = None):
        try:
            log_entry = {
                "level": level,  # info, warning, error, critical
                "event": event,
                "message": message,
                "context": context or {},
                "timestamp": datetime.now(timezone.utc),
            }
            await self.logs.insert_one(log_entry)
        except Exception as e:
            # Silently fail logging to avoid crashing high-level logic (e.g. middleware)
            logger.debug(f"Persistence log failure: {e}")

    async def get_recent_logs(self, limit: int = 50):
        cursor = self.logs.find().sort("timestamp", -1).limit(limit)
        return await cursor.to_list(length=limit)

    # --- Activity Tracking ---
    async def track_activity(
        self,
        user_id: str,
        action: str,
        resource: str,
        resource_id: Optional[str] = None,
        metadata: Dict[str, Any] = None,
    ):
        try:
            activity_entry = {
                "user_id": user_id,
                "action": action,  # create, update, delete, view
                "resource": resource,  # booking, profile, lab
                "resource_id": resource_id,
                "metadata": metadata or {},
                "timestamp": datetime.now(timezone.utc),
            }
            await self.activity.insert_one(activity_entry)
        except Exception as e:
            logger.error(f"Failed to track activity: {e}")

    # --- Analytics ---
    async def track_metric(self, name: str, value: Any, tags: Dict[str, str] = None):
        metric_entry = {
            "name": name,
            "value": value,
            "tags": tags or {},
            "timestamp": datetime.now(timezone.utc),
        }
        await self.analytics.insert_one(metric_entry)


# Initialize a global instance (singleton pattern)
mongo_service = MongoService()
