import asyncio
from app.database import async_session
from sqlalchemy import text

async def describe_table():
    async with async_session() as session:
        # Check 'technicians' table
        print("\n[SCHEMA] Describing 'technicians' table...")
        res = await session.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'technicians'
        """))
        for row in res.all():
            print(f"Col: {row[0]} | Type: {row[1]} | Nullable: {row[2]}")

if __name__ == "__main__":
    import os
    os.environ["PYTHONPATH"] = "."
    asyncio.run(describe_table())
