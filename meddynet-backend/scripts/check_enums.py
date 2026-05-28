import asyncio
from app.database import async_session
from sqlalchemy import text


async def check_enums():
    async with async_session() as session:
        out = ["[DB] Checking Enums..."]

        for enum_name in [
            "technicianstatus",
            "shifttype",
            "bookingstatus",
            "bookingtype",
        ]:
            out.append(f"Checking {enum_name}:")
            res = await session.execute(text("""
                SELECT enumlabel 
                FROM pg_enum 
                JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
                WHERE pg_type.typname = '{enum_name}'
            """))
            labels = [row[0] for row in res.all()]
            out.append(f"  Labels: {labels}")

        with open("scripts/enum_results.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(out))


if __name__ == "__main__":
    import os

    os.environ["PYTHONPATH"] = "."
    asyncio.run(check_enums())
