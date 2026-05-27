
import asyncio
from sqlalchemy import text
from app.database import pg_engine, Base
from app.models.lab import Lab

async def fix_schema():
    print("Fixing database schema (one by one)...")
    cols_to_add = {
        "registration_number": "VARCHAR(100)",
        "lab_category": "VARCHAR(100)",
        "state": "VARCHAR(100)",
        "pincode": "VARCHAR(10)",
        "branches": "VARCHAR(20)",
        "pathologist_name": "VARCHAR(200)",
        "pathologist_reg_no": "VARCHAR(100)",
        "nabl_certificate_url": "TEXT",
        "is_certified": "BOOLEAN DEFAULT FALSE",
        "plan": "VARCHAR(50) DEFAULT 'basic'"
    }
    
    for col, col_type in cols_to_add.items():
        try:
            async with pg_engine.begin() as conn:
                await conn.execute(text(f"ALTER TABLE labs ADD COLUMN {col} {col_type}"))
                print(f"Added column: {col}")
        except Exception as e:
            if "already exists" in str(e):
                print(f"Column {col} already exists, skipping.")
            else:
                print(f"Error adding {col}: {e}")
    
    print("Schema fix completed.")

if __name__ == "__main__":
    asyncio.run(fix_schema())
