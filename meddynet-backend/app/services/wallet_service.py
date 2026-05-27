from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.payment import LabWallet, Ledger, LedgerType


async def update_lab_wallet_on_payment(
    lab_id, total_amount_paise: int, commission_paise: int, booking_id, db: AsyncSession
):
    lab_amount = total_amount_paise - commission_paise

    # Update or create Wallet
    res = await db.execute(select(LabWallet).filter(LabWallet.lab_id == lab_id))
    wallet = res.scalar_one_or_none()

    if not wallet:
        wallet = LabWallet(lab_id=lab_id, pending_balance=0, total_earned=0, total_paid_out=0)
        db.add(wallet)

    wallet.pending_balance += lab_amount
    wallet.total_earned += lab_amount

    # Create Ledger Entry
    ledger = Ledger(
        lab_id=lab_id,
        type=LedgerType.credit,
        amount=lab_amount,
        reference_type="payment",
        reference_id=booking_id,
        description=f"Payment received for booking {booking_id}",
    )
    db.add(ledger)


async def deduct_lab_wallet_for_payout(lab_id, payout_amount_paise: int, payout_id: str, db: AsyncSession):
    res = await db.execute(select(LabWallet).filter(LabWallet.lab_id == lab_id))
    wallet = res.scalar_one_or_none()

    if not wallet or wallet.pending_balance < payout_amount_paise:
        raise ValueError("Insufficient pending balance for payout")

    wallet.pending_balance -= payout_amount_paise
    wallet.total_paid_out += payout_amount_paise

    ledger = Ledger(
        lab_id=lab_id,
        type=LedgerType.debit,
        amount=payout_amount_paise,
        reference_type="payout",
        reference_id=payout_id,
        description="Automated Payout to verified bank account via RazorpayX",
    )
    db.add(ledger)


async def deduct_lab_wallet_for_refund(lab_id, refund_amount_paise: int, refund_id: str, db: AsyncSession):
    res = await db.execute(select(LabWallet).filter(LabWallet.lab_id == lab_id))
    wallet = res.scalar_one_or_none()

    if wallet:
        wallet.pending_balance -= refund_amount_paise
        wallet.total_earned -= refund_amount_paise

        ledger = Ledger(
            lab_id=lab_id,
            type=LedgerType.debit,
            amount=refund_amount_paise,
            reference_type="refund",
            reference_id=refund_id,
            description="Refund adjustment for cancelled booking",
        )
        db.add(ledger)
