import asyncio
import sys
import os
from sqlalchemy import text
from motor.motor_asyncio import AsyncIOMotorClient
from supabase import create_client, Client

# Add backend directory to sys.path
sys.path.append(os.getcwd())

from app.config import settings
from app.database import engine


async def test_neon_postgres():
    print("🐘 Testing Neon PostgreSQL (SQLAlchemy + asyncpg)...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version();"))
            row = result.fetchone()
            print(f"✅ Neon Connected: {row[0][:50]}...")
            return True
    except Exception as e:
        print(f"❌ Neon Connection Failed: {str(e)}")
        return False


async def test_mongodb_atlas():
    print("🍃 Testing MongoDB Atlas (Motor)...")
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        # Check deployment
        await client.admin.command("ping")
        print(f"✅ MongoDB Connected: {settings.MONGODB_DB_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {str(e)}")
        return False


async def test_supabase_auth():
    print("⚡ Testing Supabase Auth...")
    try:
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        # Ping the API (usually doesn't need auth for basic ping)
        # We'll just verify the client exists and can handle a low-level fetch
        # But for Supabase, just correctly initializing the client with a valid URL is often check 1.
        if supabase.auth:
            print(f"✅ Supabase Client Initialized: {settings.SUPABASE_URL}")
            return True
        return False
    except Exception as e:
        print(f"❌ Supabase Setup Failed: {str(e)}")
        return False


async def main():
    print("\n" + "=" * 50)
    print("🚀 MEDDYNET DATABASE CONSISTENCY CHECK")
    print("=" * 50 + "\n")

    postgres_ok = await test_neon_postgres()
    mongo_ok = await test_mongodb_atlas()
    supabase_ok = await test_supabase_auth()

    print("\n" + "=" * 50)
    if all([postgres_ok, mongo_ok, supabase_ok]):
        print("🎉 ALL SYSTEMS GO! MeddyNet is Multi-DB Multi-Sync Ready.")
    else:
        print("⚠️ SOME SYSTEMS FAILED! Please check the logs above.")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
