
from celery import Celery

from app.config import settings

celery_app = Celery(
    "meddynet",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.payout_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.report_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

# Example Celery Beat schedule for midnight tasks
celery_app.conf.beat_schedule = {
    "process-daily-payouts": {
        "task": "app.tasks.payout_tasks.process_daily_payouts",
        "schedule": 86400.0,  # Every 24 hours (usually configured via crontab for exact midnight)
    },
}
