import asyncio
import uuid
from datetime import datetime, timezone
from app.database import async_session
from app.models.lab import Lab
from app.models.user import User
from app.models.technician import Technician, ShiftType, TechnicianStatus
from app.models.booking import Booking, BookingStatus, BookingType
from app.routers.technician_portal import update_my_location
from app.routers.bookings import track_phlebotomist
from app.schemas.technician import LocationUpdate


async def verify_gps_flow():
    print("\n[GPS TEST] Initializing Live Tracking Verification...")

    async with async_session() as db:
        try:
            # 1. Setup ecosystem with unique keys
            u_id = uuid.uuid4().hex[:6]
            lab_id = uuid.uuid4()
            user_id = uuid.uuid4()
            tech_uid = uuid.uuid4()
            tech_id = uuid.uuid4()
            booking_id = uuid.uuid4()

            p_phone = f"+919{uuid.uuid4().hex[:9]}"
            t_phone = f"+918{uuid.uuid4().hex[:9]}"
            l_phone = f"+917{uuid.uuid4().hex[:9]}"

            lab = Lab(
                id=lab_id,
                name=f"Lab {u_id}",
                slug=f"slug-{u_id}",
                phone=l_phone,
                city="Mumbai",
                address="GPS HQ",
                lat=0,
                lng=0,
            )
            db.add(lab)

            patient = User(id=user_id, name=f"Patient {u_id}", phone=p_phone, role="user")
            db.add(patient)

            tech_user = User(
                id=tech_uid,
                name=f"Tech {u_id}",
                phone=t_phone,
                role="technician",
                lab_id=lab_id,
            )
            db.add(tech_user)
            await db.flush()

            tech = Technician(
                id=tech_id,
                user_id=tech_uid,
                lab_id=lab_id,
                name=f"Tech {u_id}",
                phone=t_phone,
                shift=ShiftType.morning,
                status=TechnicianStatus.idle,
            )
            db.add(tech)

            booking = Booking(
                id=booking_id,
                user_id=user_id,
                lab_id=lab_id,
                tech_id=tech_id,
                type=BookingType.home_collection,
                scheduled_at=datetime.now(timezone.utc),
                patient_name=f"Patient {u_id}",
                patient_phone=p_phone,
                total_amount=1000,
                status=BookingStatus.on_the_way,
            )
            db.add(booking)

            await db.commit()
            print(f"  [OK] Ecosystem ready. Booking: {booking_id}")

            # 2. Simulate Tech Pulsing Location
            print("  [+] Tech pulsing location (19.1176, 72.9060)...")
            coords = LocationUpdate(lat=19.1176, lng=72.9060)
            tech_context = {
                "sub": str(tech_uid),
                "technician_id": str(tech_id),
                "role": "technician",
            }
            db_new = async_session()  # Use fresh session for pulse
            async with db_new as session:
                await update_my_location(coords, tech_context, session)

            # 3. Simulate Patient Tracking
            print("  [+] Patient tracking phlebotomist...")
            patient_context = {"sub": str(user_id), "role": "user"}
            db_track = async_session()
            async with db_track as session:
                tracking = await track_phlebotomist(str(booking_id), patient_context, session)
                print(f"  [OK] Tracking Data Received: {tracking}")

                if tracking["lat"] == 19.1176 and tracking["lng"] == 72.9060:
                    print("  [SUCCESS] GPS Pulsing & Tracking logic is 100% accurate.")
                else:
                    print(f"  [FAIL] GPS mismatch: {tracking}")

        except Exception as e:
            print(f"\n[FATAL ERROR] {e}")
            import traceback

            traceback.print_exc()


if __name__ == "__main__":
    import os

    os.environ["PYTHONPATH"] = "."
    asyncio.run(verify_gps_flow())
