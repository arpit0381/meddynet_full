import asyncio
import os
import sys

# Add the meddynet-backend directory to sys.path
sys.path.append(r"c:\Users\ashwi\.gemini\antigravity\scratch\MeddyNet - Main\meddynet-backend")

from app.database import SessionLocal
from app.models.user import User
from sqlalchemy.future import select


async def check():
    try:
        async with SessionLocal() as session:
            # Check for the user with the given phone number
            res = await session.execute(select(User).filter(User.phone == "+918235823255"))
            user = res.scalar_one_or_none()
            if user:
                print(f"USER_STATUS:FOUND")
                print(f"USER_NAME:{user.name}")
            else:
                print("USER_STATUS:NOT_FOUND")
    except Exception as e:
        print(f"ERROR:{str(e)}")


if __name__ == "__main__":
    asyncio.run(check())
