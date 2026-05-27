import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy.future import select
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)


async def async_send_reminders():
    # Find bookings pending within the next 2 hours
    now = datetime.now(timezone.utc)
    two_hours_later = now + timedelta(hours=2)

    async with SessionLocal() as db:
        res = await db.execute(
            select(Booking).filter(
                Booking.status == BookingStatus.confirmed,
                Booking.scheduled_at >= now,
                Booking.scheduled_at <= two_hours_later,
            )
        )
        bookings = res.scalars().all()

        count = 0
        for booking in bookings:
            res_user = await db.execute(select(User).filter(User.id == booking.user_id))
            user = res_user.scalar_one_or_none()
            if user and user.phone:
                msg = f"Reminder: Your MeddyNet booking {str(booking.id)[:8]} is scheduled at {booking.scheduled_at.strftime('%H:%M')}."
                await notification_service.provider.send_sms(user.phone, msg)
                count += 1

        return count


@celery_app.task
def process_appointment_reminders():
    """Runs periodically to send reminders 2 hours before appointments."""
    logger.info("Checking for appointment reminders...")
    count = asyncio.run(async_send_reminders())
    return {"status": "success", "reminders_sent": count}


@celery_app.task(bind=True, max_retries=3)
def send_otp_sms_task(self, phone: str, otp: str):
    """
    Background job to deliver OTP tokens via MSG91 with retry logic.
    """
    logger.info(f"Delivering OTP for {phone[:5]}*** via Celery background job...")
    try:
        # Standardize on asynchronous delivery via the notification service provider.
        # This will use the settings configured (MSG91/Supabase).
        asyncio.run(notification_service.provider.send_sms(phone, f"Your MeddyNet OTP is {otp}. Valid for 5 mins."))
    except Exception as exc:
        logger.error(f"OTP delivery failed for {phone}: {exc}")
        # Retry with exponential backoff if configured
        raise self.retry(exc=exc, countdown=2**self.request.retries)


@celery_app.task
def send_booking_confirmation_sms(phone: str, booking_id: str):
    asyncio.run(notification_service.send_booking_confirmation(phone, booking_id))
