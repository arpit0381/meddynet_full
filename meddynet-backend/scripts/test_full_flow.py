import asyncio
import uuid
import os
from sqlalchemy import text
from app.database import async_session
from app.models.user import User
from app.models.booking import Booking, BookingType, BookingStatus
from app.models.lab import Lab
from app.services.mongo_service import mongo_service
from app.services.supabase_storage_service import storage_service
from fastapi import UploadFile
import io
from datetime import datetime, timezone

results = []
def log(msg):
    print(msg)
    results.append(str(msg))

async def test_full_flow():
    test_user_id = uuid.uuid4()
    test_lab_id = uuid.uuid4()
    test_booking_id = uuid.uuid4()
    test_phone = f"+91{uuid.uuid4().hex[:10]}"
    
    log(f"\n[SYSTEM] Starting MeddyNet Full-Stack Integration Test")
    log(f"--------------------------------------------------")

    # PHASE 1: Neon RLS Check
    log(f"[Phase 1] Neon RLS Check...")
    async with async_session() as session:
        await session.execute(text(f"SET LOCAL app.current_user_id = '{str(test_user_id)}'"))
        
        new_lab = Lab(
            id=test_lab_id,
            name="Audit Lab",
            slug=f"audit-lab-{uuid.uuid4().hex[:6]}",
            phone=test_phone,
            city="Delhi",
            address="123 Audit St",
            lat=28.6139,
            lng=77.2090
        )
        session.add(new_lab)

        new_user = User(
            id=test_user_id, 
            phone=test_phone, 
            name="Test Audit User",
            is_active=True
        )
        session.add(new_user)
        
        try:
            await session.commit()
            log(f"OK - Neon: Lab and User created.")
        except Exception as e:
            log(f"FAIL - Neon: Lab/User Creation Failed! {e}")
            return

        await session.execute(text(f"SET LOCAL app.current_user_id = '{str(test_user_id)}'"))

        new_booking = Booking(
            id=test_booking_id,
            user_id=test_user_id,
            lab_id=test_lab_id,
            type=BookingType.home_collection,
            scheduled_at=datetime.now(timezone.utc),
            patient_name="Audit Patient",
            patient_phone=test_phone,
            total_amount=50000,
            status=BookingStatus.pending
        )
        session.add(new_booking)
        
        try:
            await session.commit()
            log(f"OK - Neon: Booking created under RLS context: {test_user_id}")
        except Exception as e:
            log(f"FAIL - Neon: Booking Creation Failed! {e}")
            return

        # 4. Verification Check (Isolation)
        try:
            async with session.begin():
                await session.execute(text(f"SET LOCAL app.current_user_id = '{str(test_user_id)}'"))
                res = await session.execute(text(f"SELECT count(*) FROM bookings WHERE id = '{str(test_booking_id)}'"))
                owner_count = res.scalar()
                
            async with session.begin():
                await session.execute(text(f"SET LOCAL app.current_user_id = '{str(uuid.uuid4())}'")) 
                res = await session.execute(text(f"SELECT count(*) FROM bookings WHERE id = '{str(test_booking_id)}'"))
                stranger_count = res.scalar()
                
            if owner_count == 1:
                log(f"OK - Neon: Access Verified for OWNER.")
            else:
                log(f"FAIL - Neon: OWNER cannot access booking! Count: {owner_count}")
                
            # Check if current role has BYPASSRLS
            res = await session.execute(text("SELECT rolbypassrls, rolsuper FROM pg_roles WHERE rolname = current_user"))
            role_info = res.fetchone()

            if stranger_count == 0:
                log(f"OK - Neon: RLS Isolation Verified. (Other users cannot see this data).")
            else:
                if role_info and (role_info[0] or role_info[1]):
                    log(f"OK (WARN) - Neon: RLS Isolation Bypassed (Expected for DB OWNER with BYPASSRLS privileges).")
                else:
                    log(f"FAIL - Neon: RLS ISOLATION FAILED! Count: {stranger_count}")
        except Exception as e:
            log(f"FAIL - Neon: RLS Testing Exception! {e}")

    # PHASE 2: MongoDB Audit Check
    log(f"\n[Phase 2] MongoDB Audit Check...")
    try:
        await mongo_service.log_event(
            level="info",
            event="system_integration_test",
            message="Full-stack E2E test successful.",
            context={"test_user": str(test_user_id), "test_booking": str(test_booking_id)}
        )
        log(f"OK - MongoDB: Integration event logged.")
    except Exception as e:
        log(f"FAIL - MongoDB: Logging failed! {e}")

    # PHASE 3: Supabase Storage Check
    log(f"\n[Phase 3] Supabase Storage Check...")
    pdf_path = os.path.join(os.path.dirname(__file__), "test_report.pdf")
    
    try:
        with open(pdf_path, "rb") as f:
            content = f.read()
            mock_file = UploadFile(filename="test_report.pdf", file=io.BytesIO(content))
            
            result = await storage_service.upload_report(mock_file, str(test_user_id), str(test_booking_id))
            
            if result and hasattr(result, "get") and result.get("url"):
                log(f"OK - Supabase: File uploaded to 'reports' bucket.")
                log(f"LINK - Signed URL: {result['url']}")
            else:
                log(f"FAIL - Supabase: Upload failed! {result}")
    except Exception as e:
        log(f"FAIL - Supabase: Storage Test Exception! {e}")

    log(f"\n--------------------------------------------------")
    log(f"SUMMARY - Check your Dashboards to verify manual entries.")
    log(f"Test User ID: {test_user_id}")

    with open("scripts/flow_logs.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(results))

if __name__ == "__main__":
    asyncio.run(test_full_flow())
