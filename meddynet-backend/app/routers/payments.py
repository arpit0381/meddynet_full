import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.database import get_db
from app.schemas.payment import PaymentCreate, PaymentVerify, DepositCreate
from app.models.payment import Payment, PaymentStatus
from app.models.booking import Booking, BookingStatus
from app.models.lab import Lab
from app.models.user import User
from app.middleware.rbac import get_current_user
from app.services.payment_service import payment_service
from app.services.wallet_service import update_lab_wallet_on_payment
from app.services.mongo_service import mongo_service

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


@router.post("/create-order")
async def create_order(
    payload: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Booking).filter(Booking.id == payload.booking_id))
    booking = res.scalar_one_or_none()

    if not booking or str(booking.user_id) != current_user["sub"]:
        raise HTTPException(status_code=404, detail="Booking not found or unauthorized")

    res_lab = await db.execute(select(Lab).filter(Lab.id == booking.lab_id))
    lab = res_lab.scalar_one_or_none()

    amount_to_pay = booking.total_amount - booking.discount_amount
    commission_rate = lab.commission_rate if lab else 0.18
    commission_amount = int(amount_to_pay * commission_rate)
    lab_amount = amount_to_pay - commission_amount

    try:
        rp_order = await payment_service.initiate_payment(amount_to_pay)
    except Exception as e:
        logger.error(
            f"Payment initiation failed for booking {payload.booking_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500, detail="Payment integration error. Please try again."
        )

    new_payment = Payment(
        booking_id=booking.id,
        user_id=booking.user_id,
        lab_id=booking.lab_id,
        razorpay_order_id=rp_order["id"],
        total_amount=amount_to_pay,
        commission_amount=commission_amount,
        lab_amount=lab_amount,
        status=PaymentStatus.pending,
    )
    db.add(new_payment)

    # Log Order Creation in MongoDB
    await mongo_service.log_event(
        level="info",
        event="payment_order_created",
        message=f"Razorpay order {rp_order['id']} created for booking {booking.id}",
        context={
            "booking_id": str(booking.id),
            "user_id": str(current_user["sub"]),
            "amount": amount_to_pay,
            "razorpay_order_id": rp_order["id"],
        },
    )

    await db.commit()

    return {
        "razorpay_order_id": rp_order["id"],
        "amount": amount_to_pay,
        "currency": "INR",
    }


@router.post("/deposit")
async def create_deposit(
    payload: DepositCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a standalone Razorpay order for wallet top-up."""
    try:
        rp_order = await payment_service.initiate_payment(payload.amount)
    except Exception as e:
        logger.error(f"Deposit order creation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail="Payment integration error. Please try again."
        )

    new_payment = Payment(
        user_id=uuid.UUID(current_user["sub"]),
        razorpay_order_id=rp_order["id"],
        total_amount=payload.amount,
        commission_amount=0,
        lab_amount=0,
        status=PaymentStatus.pending,
    )
    db.add(new_payment)
    await db.commit()

    return {
        "razorpay_order_id": rp_order["id"],
        "amount": payload.amount,
        "currency": "INR",
    }


@router.post("/verify")
async def verify_payment(payload: PaymentVerify, db: AsyncSession = Depends(get_db)):
    # Payload for validation
    verification_payload = {
        "razorpay_order_id": payload.razorpay_order_id,
        "razorpay_payment_id": payload.razorpay_payment_id,
        "razorpay_signature": payload.razorpay_signature,
    }
    is_valid = await payment_service.validate_transaction(verification_payload)

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    res = await db.execute(
        select(Payment).filter(Payment.razorpay_order_id == payload.razorpay_order_id)
    )
    payment = res.scalar_one_or_none()

    if not payment or payment.status == PaymentStatus.paid:
        return {"status": "Already processed or missing"}

    payment.razorpay_payment_id = payload.razorpay_payment_id
    payment.status = PaymentStatus.paid

    if payment.booking_id:
        b_res = await db.execute(
            select(Booking).filter(Booking.id == payment.booking_id)
        )
        booking = b_res.scalar_one()
        booking.status = BookingStatus.confirmed
        await update_lab_wallet_on_payment(
            payment.lab_id,
            payment.total_amount,
            payment.commission_amount,
            booking.id,
            db,
        )
    else:
        # User Wallet Top-up
        u_res = await db.execute(select(User).filter(User.id == payment.user_id))
        user = u_res.scalar_one()
        user.wallet_balance += payment.total_amount

        # Log Deposit as Activity
        await mongo_service.track_activity(
            user_id=str(user.id),
            action="wallet_deposit",
            resource="payment",
            resource_id=str(payment.id),
            metadata={"amount": payment.total_amount},
        )

    # Track Activity and Log Payment Success in MongoDB
    await mongo_service.log_event(
        level="info",
        event="payment_success",
        message=f"Payment {payment.id} verified {'for booking '+str(payment.booking_id) if payment.booking_id else 'for wallet top-up'}",
        context={"razorpay_payment_id": payload.razorpay_payment_id},
    )

    await db.commit()
    return {"message": "Success"}


@router.get("/me")
async def get_my_payments(
    current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Fetch all payments for the logged-in user."""
    result = await db.execute(
        select(Payment)
        .filter(Payment.user_id == uuid.UUID(current_user["sub"]))
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "booking_id": str(p.booking_id),
            "razorpay_order_id": p.razorpay_order_id,
            "razorpay_payment_id": p.razorpay_payment_id,
            "total_amount": p.total_amount,
            "commission_amount": p.commission_amount,
            "lab_amount": p.lab_amount,
            "status": p.status.value,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in payments
    ]


@router.get("/{payment_id}")
async def get_payment_detail(
    payment_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch a single payment detail."""
    result = await db.execute(
        select(Payment).filter(
            Payment.id == uuid.UUID(payment_id),
            Payment.user_id == uuid.UUID(current_user["sub"]),
        )
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {
        "id": str(p.id),
        "booking_id": str(p.booking_id),
        "razorpay_order_id": p.razorpay_order_id,
        "razorpay_payment_id": p.razorpay_payment_id,
        "total_amount": p.total_amount,
        "commission_amount": p.commission_amount,
        "lab_amount": p.lab_amount,
        "status": p.status.value,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }
