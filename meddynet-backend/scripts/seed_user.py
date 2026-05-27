import asyncio
import uuid
import sys
import os

# Ensure the root directory is on the path for app imports
sys.path.append(os.getcwd())

from app.database import async_session
from app.models.user import User
from app.services.auth_service import get_password_hash

async def seed_user():
    async with async_session() as db:
        # Check if Arpit exists
        from sqlalchemy import select
        res = await db.execute(select(User).filter(User.email == "arpitbajpai038@gmail.com"))
        existing = res.scalar_one_or_none()
        
        if existing:
            print("User Arpit already exists. Updating password to 'Password@123'")
            existing.hashed_password = get_password_hash("Password@123")
        else:
            print("Creating new user Arpit...")
            new_user = User(
                name="Arpit Bajpai",
                email="arpitbajpai038@gmail.com",
                phone="+919876543210",
                hashed_password=get_password_hash("Password@123"),
                role="user",
                is_active=True
            )
            db.add(new_user)
        
        await db.commit()
        print("Seed Successful! You can now login with: arpitbajpai038@gmail.com / Password@123")

if __name__ == "__main__":
    asyncio.run(seed_user())
