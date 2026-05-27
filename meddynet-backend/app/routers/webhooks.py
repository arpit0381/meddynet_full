import hashlib
import hmac
import json
import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.services.mongo_service import mongo_service
from app.services.notification_service import notification_service
from app.services.wallet_service import update_lab_wallet_on_payment

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    payload_body = await request.body()

    # FIX 8: Early guard for missing signature header to prevent TypeError in hmac.compare_digest
    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing Razorpay signature header")

    if not settings.RAZORPAY_WEBHOOK_SECRET:
        return {"status": "No webhook secret configured"}

    expected_sig = hmac.new(
        key=settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        msg=payload_body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_sig, x_razorpay_signature):
        raise HTTPException(status_code=400, detail="Webhook sig validation failed")

    event_data = json.loads(payload_body)
    event_type = event_data.get("event")

    if event_type == "payment.captured":
        payment_payload = event_data["payload"]["payment"]["entity"]
        order_id = payment_payload["order_id"]
        payment_id = payment_payload["id"]

        # Reconciliation logic
        res = await db.execute(select(Payment).filter(Payment.razorpay_order_id == order_id))
        payment = res.scalar_one_or_none()

        if payment and payment.status != PaymentStatus.paid:
            payment.status = PaymentStatus.paid
            payment.razorpay_payment_id = payment_id

            # Confirm Booking
            b_res = await db.execute(select(Booking).filter(Booking.id == payment.booking_id))
            booking = b_res.scalar_one_or_none()
            if booking:
                booking.status = BookingStatus.confirmed

                # Update Lab Wallet
                await update_lab_wallet_on_payment(
                    payment.lab_id,
                    payment.total_amount,
                    payment.commission_amount,
                    booking.id,
                    db,
                )

                # Send Notification
                await notification_service.send_booking_confirmation(booking.patient_phone, str(booking.id))

                # Log to MongoDB
                await mongo_service.log_event(
                    level="info",
                    event="webhook_reconciliation",
                    message=f"Payment {payment_id} reconciled for order {order_id}",
                )
                await db.commit()

    return {"status": "ok"}
