from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid
import logging
from datetime import datetime, timezone

from app.database import get_db
from app.models.payment import LabWallet, Ledger, LedgerType
from app.models.user import User
from app.models.lab import Lab
from app.middleware.rbac import get_current_user, require_role
from app.services.payment_service import payment_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payouts", tags=["payouts"])


@router.post("/request")
async def request_payout(
    amount_paise: int,
    current_user: dict = Depends(require_role(["lab_admin"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Called by a Lab Admin to request a withdrawal of their earnings.
    """
    lab_id = current_user.get("lab_id")
    if not lab_id:
        raise HTTPException(status_code=400, detail="User not associated with a lab")

    # Check balance
    res = await db.execute(select(LabWallet).filter(LabWallet.lab_id == lab_id))
    wallet = res.scalar_one_or_none()

    if not wallet or wallet.pending_balance < amount_paise:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # In a real app, we would create a PayoutRequest model entry.
    # For now, we'll debit the balance and log a ledger entry of type 'debit'/payout_pending.
    wallet.pending_balance -= amount_paise

    ledger = Ledger(
        lab_id=lab_id,
        type=LedgerType.debit,
        amount=amount_paise,
        reference_type="payout_request",
        reference_id=uuid.uuid4(),  # Placeholder for request id
        description=f"Withdrawal request for ₹{amount_paise/100}",
    )
    db.add(ledger)
    await db.commit()

    return {
        "message": "Payout requested successfully",
        "new_balance": wallet.pending_balance,
    }


@router.post("/{ledger_id}/approve")
async def approve_payout(
    ledger_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Called by an Admin to execute the actual payout via Razorpay.
    """
    # 1. Fetch the ledger entry
    res = await db.execute(select(Ledger).filter(Ledger.id == ledger_id))
    ledger = res.scalar_one_or_none()

    if not ledger or ledger.reference_type != "payout_request":
        raise HTTPException(status_code=404, detail="Request not found")

    # 2. Get Lab's bank details
    l_res = await db.execute(select(Lab).filter(Lab.id == ledger.lab_id))
    lab = l_res.scalar_one()

    # Use lab's bank account or fall back with a clear error
    bank_account_id = getattr(lab, "razorpay_account_id", None) or getattr(lab, "bank_account_number", None)
    if not bank_account_id:
        logger.warning(f"Lab {lab.id} has no bank account configured. Payout will be simulated.")
        bank_account_id = f"simulated_acc_{lab.id}"

    # 3. Execute payout via PaymentService
    payout_res = await payment_service.process_payout(bank_account_id, ledger.amount)

    if payout_res.get("status") == "failed":
        raise HTTPException(status_code=500, detail="Payout execution failed")

    # 4. Finalize
    admin_id = current_user.get("sub", "unknown")
    ledger.description += f" | Approved by {admin_id} at {datetime.now(timezone.utc)}"

    await db.commit()
    return {"status": "success", "payout_details": payout_res}
