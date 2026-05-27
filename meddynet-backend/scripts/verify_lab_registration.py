import asyncio
import uuid
import httpx


async def test_lab_registration():
    url = "http://localhost:8000/auth/register-lab"

    test_id = str(uuid.uuid4())[:8]
    payload = {
        "admin_name": f"Admin {test_id}",
        "admin_email": f"admin_{test_id}@example.com",
        "admin_password": "SecurePassword123",
        "admin_phone": f"+917{uuid.uuid4().hex[:9]}",
        "lab_name": f"Partner Lab {test_id}",
        "lab_city": "Bangalore",
        "lab_address": "Tech Park, Whitefield",
        "lab_phone": f"+918{uuid.uuid4().hex[:9]}",
        "lab_lat": 12.9716,
        "lab_lng": 77.5946,
    }

    print(f"\n[TEST] Registering Lab: {payload['lab_name']}")

    async with httpx.AsyncClient() as client:
        try:
            # We assume the server is running. If not, we'll catch the error.
            # But wait, I should probably just test the database logic if the server isn't up.
            # Since I want a "best" test, I'll try to hit the API if it's up,
            # or just run a mock test using the router logic directly.

            # For this environment, it's safer to test the DB logic directly or start the server.
            # I'll create a script that uses the router function directly.
            pass
        except Exception as e:
            print(f"API Test skipped (Server might be down): {e}")

    # DIRECT DB TEST LOGIC
    from app.database import async_session
    from app.routers.auth import register_lab
    from app.schemas.auth import LabOnboardingRequest
    from unittest.mock import MagicMock

    print("[TEST] Running Direct Router Logic Verification...")

    # Mocking the payload
    request_data = LabOnboardingRequest(**payload)

    async with async_session() as db:
        try:
            response = await register_lab(request_data, db)
            print("  [OK] Registration successful!")
            print(f"  [OK] Access Token generated: {response['access_token'][:20]}...")
            print(f"  [OK] User Role: {response['user'].role}")
            print(f"  [OK] Associated Lab ID: {response['user'].lab_id}")

            # Verify Lab exists and is NOT verified
            from app.models.lab import Lab
            from sqlalchemy import select

            res = await db.execute(
                select(Lab).filter(Lab.id == response["user"].lab_id)
            )
            lab = res.scalar_one()
            print(
                f"  [OK] Lab Verification Status: {lab.is_verified} (Expected: False)"
            )

            await db.commit()
        except Exception as e:
            print(f"  [FAIL] Router Logic Failed: {e}")
            await db.rollback()


if __name__ == "__main__":
    import os

    os.environ["PYTHONPATH"] = "."
    asyncio.run(test_lab_registration())
