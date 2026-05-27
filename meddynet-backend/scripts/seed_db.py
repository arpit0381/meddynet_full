import asyncio
import uuid
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete

from app.config import settings
from app.models.user import User
from app.models.lab import Lab, LabTest, SubscriptionPlan
from app.models.technician import Technician, ShiftType, TechnicianStatus
from app.services.auth_service import get_password_hash


async def seed():
    url = settings.DATABASE_URL
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        async with session.begin():
            print("--- Wiping existing data ---")
            await session.execute(delete(LabTest))
            await session.execute(delete(Technician))
            await session.execute(delete(User))
            await session.execute(delete(Lab))

            print("--- Seeding Admin ---")
            admin_id = uuid.uuid4()
            admin = User(
                id=admin_id,
                phone="+910000000000",
                name="Platform Admin",
                email="admin@meddynet.com",
                role="admin",
                hashed_password=get_password_hash("admin123"),
            )
            session.add(admin)

            print("--- Seeding Labs ---")
            lab1_id = uuid.uuid4()
            lab1 = Lab(
                id=lab1_id,
                name="Apex Diagnostics & Research",
                slug="apex-diagnostics",
                phone="+911234567890",
                city="Delhi",
                address="123 Health Ave, South Delhi, Delhi",
                lat=28.6139,
                lng=77.2090,
                is_verified=True,
                plan=SubscriptionPlan.premium.value,
            )
            session.add(lab1)

            tests = [
                {
                    "name": "Complete Blood Count (CBC)",
                    "price": 45000,
                    "mrp": 60000,
                    "category": "Hematology",
                    "hours": 24,
                },
                {
                    "name": "Lipid Profile",
                    "price": 85000,
                    "mrp": 120000,
                    "category": "Biochemistry",
                    "hours": 12,
                },
                {
                    "name": "Thyroid Profile (T3, T4, TSH)",
                    "price": 120000,
                    "mrp": 180000,
                    "category": "Hormones",
                    "hours": 24,
                },
            ]
            for t in tests:
                test = LabTest(
                    lab_id=lab1_id,
                    name=t["name"],
                    price=t["price"],
                    mrp=t["mrp"],
                    category=t["category"],
                    turnaround_hours=t["hours"],
                    is_active=True,
                )
                session.add(test)

            print(
                "--- Seeding Technicians (using Manual SQL for Enum compatibility) ---"
            )
            tech_user_id = uuid.uuid4()
            tech_user = User(
                id=tech_user_id,
                phone="+919999999999",
                name="Rahul Sharma",
                email="rahul.tech@meddynet.com",
                role="technician",
                hashed_password=get_password_hash("tech123"),
            )
            session.add(tech_user)

            # CRITICAL: Flush the session so the User exists in the DB before the raw SQL Technician insertion
            await session.flush()

            tech_id = uuid.uuid4()
            # Raw SQL bypass for Technician Enums
            await session.execute(
                sa.text("""
                INSERT INTO technicians (id, lab_id, user_id, name, phone, shift, status, rating, is_active)
                VALUES (:id, :lab_id, :user_id, :name, :phone, :shift, :status, :rating, :is_active)
            """),
                {
                    "id": tech_id,
                    "lab_id": lab1_id,
                    "user_id": tech_user_id,
                    "name": "Rahul Sharma",
                    "phone": "+919999999999",
                    "shift": "morning",
                    "status": "off_duty",
                    "rating": 4.9,
                    "is_active": True,
                },
            )

            # Link back IDs
            tech_user.lab_id = lab1_id
            tech_user.technician_id = tech_id

        print("Done! Seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
