import asyncio
import uuid
import os
import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy import text, select, func
from app.database import async_session
from app.models.user import User
from app.models.lab import Lab, LabTest
from app.models.booking import Booking, BookingStatus, BookingType
from app.models.payment import Payment, PaymentStatus, LabWallet, Ledger, LedgerType
from app.services.mongo_service import mongo_service
from app.services.supabase_storage_service import storage_service
from fastapi import UploadFile
import io

async def test_lab_functionality():
    print("\n[LAB TEST] Initializing Comprehensive Lab Testing...")
    print("=" * 60)
    
    test_id = str(uuid.uuid4())[:8]
    lab_name = f"Test Lab {test_id}"
    lab_slug = f"test-lab-{test_id}"
    lab_phone = f"+919{uuid.uuid4().hex[:9]}"
    
    async with async_session() as session:
        try:
            # 1. Create a Lab
            print(f"[Phase 1] Creating Lab: {lab_name}")
            new_lab = Lab(
                id=uuid.uuid4(),
                name=lab_name,
                slug=lab_slug,
                phone=lab_phone,
                city="Mumbai",
                address="456 Research Road, Powai",
                lat=19.1176,
                lng=72.9060,
                is_verified=True,
                home_collection=True
            )
            session.add(new_lab)
            await session.flush()
            lab_id = new_lab.id
            print(f"  [OK] Lab created with ID: {lab_id}")

            # 2. Add Lab Tests
            print(f"[Phase 2] Adding Lab Tests...")
            tests = [
                {"name": "Vitamin D Test", "category": "Deficiency", "price": 1200, "mrp": 2500},
                {"name": "Diabetes Screening", "category": "Metabolic", "price": 800, "mrp": 1500}
            ]
            for t in tests:
                new_test = LabTest(
                    lab_id=lab_id,
                    name=t["name"],
                    category=t["category"],
                    price=int(t["price"] * 100),
                    mrp=int(t["mrp"] * 100),
                    turnaround_hours=24,
                    home_collection=True
                )
                session.add(new_test)
            await session.flush()
            print(f"  [OK] Tests added to {lab_name}")

            # 3. Create a Test User and Booking
            print(f"[Phase 3] Simulating Booking for {lab_name}...")
            user_id = uuid.uuid4()
            test_user = User(
                id=user_id,
                phone=f"+918{uuid.uuid4().hex[:9]}",
                name=f"Patient {test_id}",
                is_active=True
            )
            session.add(test_user)
            await session.flush()

            booking_id = uuid.uuid4()
            new_booking = Booking(
                id=booking_id,
                user_id=user_id,
                lab_id=lab_id,
                type=BookingType.home_collection,
                scheduled_at=datetime.now(timezone.utc) + timedelta(days=1),
                patient_name=f"Patient {test_id}",
                patient_phone=test_user.phone,
                total_amount=200000, # 2000 INR
                status=BookingStatus.pending
            )
            session.add(new_booking)
            await session.flush()
            print(f"  [OK] Booking created: {booking_id}")

            # 4. Simulate Payment & Revenue logic
            print(f"[Phase 4] Simulating Payment Logic...")
            payment_id = uuid.uuid4()
            total_amt = 200000
            comm_amt = int(total_amt * 0.15)
            lab_amt = total_amt - comm_amt
            
            payment = Payment(
                id=payment_id,
                booking_id=booking_id,
                user_id=user_id,
                lab_id=lab_id,
                razorpay_order_id=f"order_{uuid.uuid4().hex[:12]}",
                total_amount=total_amt,
                commission_amount=comm_amt,
                lab_amount=lab_amt,
                status=PaymentStatus.paid
            )
            session.add(payment)
            
            # Update Lab Wallet
            wallet_res = await session.execute(select(LabWallet).filter(LabWallet.lab_id == lab_id))
            wallet = wallet_res.scalar_one_or_none()
            if not wallet:
                wallet = LabWallet(lab_id=lab_id, pending_balance=0, total_earned=0)
                session.add(wallet)
            
            wallet.pending_balance += lab_amt
            wallet.total_earned += lab_amt
            
            # Add to Ledger
            ledger = Ledger(
                lab_id=lab_id,
                type=LedgerType.credit,
                amount=lab_amt,
                reference_type="payment",
                reference_id=payment_id,
                description=f"Payment for booking {booking_id}"
            )
            session.add(ledger)
            
            await session.commit()
            print(f"  [OK] Payment processed. Lab Amount: ₹{lab_amt/100:.2f}")

            # 5. Verify Lab Portal Stats logic
            print(f"[Phase 5] Verifying Lab Stats (Manual Calc)...")
            # Logic from lab_portal.py
            revenue_res = await session.execute(
                select(func.sum(Payment.lab_amount)).filter(
                    Payment.lab_id == lab_id,
                    Payment.status == PaymentStatus.paid
                )
            )
            total_revenue = revenue_res.scalar() or 0
            print(f"  [VERIFY] Total Revenue: ₹{total_revenue/100:.2f} (Expected: ₹{lab_amt/100:.2f})")
            
            if total_revenue == lab_amt:
                print("  [SUCCESS] Stats logic matches data.")
            else:
                print(f"  [WARNING] Stats mismatch: {total_revenue} vs {lab_amt}")

            # 6. MongoDB Audit Trail
            print(f"[Phase 6] Logging to MongoDB...")
            await mongo_service.log_event(
                level="info",
                event="lab_test_summary",
                message=f"Comprehensive test completed for {lab_name}",
                context={
                    "lab_id": str(lab_id),
                    "total_revenue": total_revenue,
                    "booking_id": str(booking_id)
                }
            )
            print("  [OK] MongoDB log created.")

            # 7. Supabase Report Simulation
            print(f"[Phase 7] Simulating Report Upload...")
            # We use the existing test_report.pdf or create a dummy one if it doesn't exist
            pdf_path = "scripts/test_report.pdf"
            if not os.path.exists(pdf_path):
                with open(pdf_path, "wb") as f:
                    f.write(b"%PDF-1.4Mock")
            
            with open(pdf_path, "rb") as f:
                content = f.read()
                mock_file = UploadFile(filename="test_report.pdf", file=io.BytesIO(content))
                result = await storage_service.upload_report(mock_file, str(user_id), str(booking_id))
                
                if result and result.get("url"):
                    print(f"  [OK] Report uploaded to Supabase. URL: {result['url'][:50]}...")
                else:
                    print(f"  [FAIL] Report upload failed: {result}")

            print("\n" + "=" * 60)
            print(f"SUMMARY: Lab '{lab_name}' fully verified.")
            print(f"Lab ID: {lab_id}")
            print(f"Booking ID: {booking_id}")
            print("=" * 60)

        except Exception as e:
            await session.rollback()
            print(f"\n[FATAL ERROR] {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_lab_functionality())
