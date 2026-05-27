import asyncio
import logging
import uuid

from sqlalchemy.future import select

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.payment import LabWallet
from app.services.analytics_service import analytics_service
from app.services.payment_service import payment_service
from app.services.wallet_service import deduct_lab_wallet_for_payout

logger = logging.getLogger(__name__)


async def async_process_payouts():
    async with SessionLocal() as db:
        res = await db.execute(select(LabWallet).filter(LabWallet.pending_balance > 0))
        wallets = res.scalars().all()

        count = 0
        for wallet in wallets:
            try:
                # We assume Lab has a razorpay account ID stored somewhere.
                # In this demo, we use a placeholder or log if missing.
                payout_amount = wallet.pending_balance
                # Call RazorpayX
                response = await payment_service.process_payout(
                    fund_account_id=f"fa_{wallet.lab_id}", amount_paise=payout_amount
                )

                payout_id = response.get("id", f"pout_{uuid.uuid4().hex[:8]}")

                # Update Wallet Ledger & Deduct
                await deduct_lab_wallet_for_payout(wallet.lab_id, payout_amount, payout_id, db)

                # Log Analytics
                await analytics_service.log_payout_success(str(wallet.lab_id), payout_amount, payout_id)
                count += 1
            except Exception as e:
                logger.error(f"Payout failed for Lab {wallet.lab_id}: {e}")

        await db.commit()
        return count


@celery_app.task
def process_daily_payouts():
    logger.info("Executing daily payout processing...")
    # Celery tasks are synchronous; wrap the async logic.
    count = asyncio.run(async_process_payouts())
    return {"status": "success", "payouts_processed": count}
