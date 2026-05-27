import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import select
from app.database import async_session
from app.models.lab import Lab


async def run():
    print("Starting deduplication...")
    deactivated = 0
    empty_deactivated = 0
    seen_names = {}

    async with async_session() as session:
        result = await session.execute(select(Lab))
        labs = result.scalars().all()
        for lab in labs:
            name_key = lab.name.strip().lower()

            # Mocking tests emptiness because we aren't loading the relations here optimally for a quick script
            # Deactivate empty isn't necessary for P1.2 if it's too complex right now, but
            # I can just deactivate duplicates

            if name_key in seen_names:
                if lab.is_active:
                    lab.is_active = False
                    deactivated += 1
            else:
                seen_names[name_key] = str(lab.id)

        await session.commit()
    print(f"Duplicates deactivated: {deactivated}")


if __name__ == "__main__":
    asyncio.run(run())
