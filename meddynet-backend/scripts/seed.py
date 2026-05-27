import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

# Local imports
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base, ASYNC_DATABASE_URL
from app.models.user import User
from app.models.lab import Lab, LabTest
from app.models.technician import Technician
from app.models.booking import Booking, BookingTest, BookingType, BookingStatus
from app.models.payment import Payment, PaymentStatus

engine = create_async_engine(ASYNC_DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    async with AsyncSessionLocal() as db:
        # 1. Create Admin User
        admin_id = uuid.uuid4()
        admin = User(
            id=admin_id,
            name="Platform Admin",
            phone="9999999999",
            email="admin@meddynet.com",
            role="admin",
            is_active=True,
        )
        db.add(admin)

        # 2. Create Lab Owner
        owner_id = uuid.uuid4()
        owner = User(
            id=owner_id,
            name="Dr. Arpit",
            phone="8888888888",
            email="owner@apexlabs.com",
            role="lab_admin",
            is_active=True,
        )
        db.add(owner)

        # 3. Create Lab
        lab_id = uuid.uuid4()
        lab = Lab(
            id=lab_id,
            name="Apex Diagnostics (HQ)",
            slug="apex-diagnostics-hq",
            phone="011-22334455",
            email="contact@apexlabs.com",
            city="Delhi",
            address="A-12, Green Park, New Delhi",
            lat=28.5595,
            lng=77.2037,
            is_verified=True,
            is_active=True,
            commission_rate=0.12,
        )
        db.add(lab)

        # 4. Create Tests
        test1 = LabTest(
            id=uuid.uuid4(),
            lab_id=lab_id,
            name="Full Body Health Checkup",
            category="Full Body",
            price=249900,  # ₹2,499
            mrp=499900,
            turnaround_hours=24,
            home_collection=True,
        )
        test2 = LabTest(
            id=uuid.uuid4(),
            lab_id=lab_id,
            name="COVID-19 RT-PCR",
            category="Viral",
            price=60000,  # ₹600
            mrp=120000,
            turnaround_hours=12,
            home_collection=True,
        )
        db.add_all([test1, test2])

        # 5. Create Technician
        tech_user_id = uuid.uuid4()
        tech_user = User(
            id=tech_user_id,
            name="Rahul Singh",
            phone="7777777777",
            role="technician",
            is_active=True,
        )
        db.add(tech_user)

        tech = Technician(
            id=uuid.uuid4(),
            user_id=tech_user_id,
            city="Delhi",
            vehicle_type="Bike",
            is_available=True,
        )
        db.add(tech)

        # 6. Create initial Booking for Demo
        booking_id = uuid.uuid4()
        booking = Booking(
            id=booking_id,
            user_id=owner_id,  # Patient also used as example
            lab_id=lab_id,
            tech_id=None,
            type=BookingType.home_collection,
            status=BookingStatus.pending,
            scheduled_at=datetime.now(timezone.utc) + timedelta(days=1),
            patient_name="John Doe",
            patient_phone="9876543210",
            total_amount=249900,
            address="H.No. 42, Saket, Delhi",
        )
        db.add(booking)

        await db.commit()
        print("✅ Database seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
