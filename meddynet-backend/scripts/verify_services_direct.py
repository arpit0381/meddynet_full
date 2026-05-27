import asyncio
import uuid
from app.database import async_session
from sqlalchemy import text
from app.services.mongo_service import mongo_service
from app.services.auth_service import supabase_admin
from app.redis import redis_client


async def verify_everything_direct():
    print(f"\n[SYSTEM] Deep Service Connection Verification (Direct Import)")
    print(f"--------------------------------------------------")

    # 1. NeonDB (Postgres)
    print(f"[Phase 1] NeonDB Check...")
    try:
        async with async_session() as session:
            res = await session.execute(text("SELECT VERSION()"))
            version = res.scalar()
            print(f"✅ NEONDB: Healthy ({version.split(',')[0]})")
    except Exception as e:
        print(f"❌ NEONDB: Failed! {e}")

    # 2. MongoDB Atlas
    print(f"\n[Phase 2] MongoDB Atlas Check...")
    try:
        # Ping command to verify SSL/TLS Handshake
        await mongo_service.client.admin.command("ping")
        count = await mongo_service.logs.count_documents({})
        print(f"✅ MONGODB: Healthy (Log Count: {count})")
    except Exception as e:
        print(f"❌ MONGODB: Failed! (SSL handshakes typically fail here on Windows if certifi is missing) {e}")

    # 3. Supabase Storage
    print(f"\n[Phase 3] Supabase Storage Check...")
    try:
        # List buckets to verify Service Role Access
        buckets = supabase_admin.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        print(f"✅ SUPABASE: Healthy (Buckets: {', '.join(bucket_names)})")
    except Exception as e:
        print(f"❌ SUPABASE: Failed! {e}")

    # 4. Redis
    print(f"\n[Phase 4] Redis Check...")
    try:
        await redis_client.ping()
        print(f"✅ REDIS: Healthy")
    except Exception as e:
        print(f"❌ REDIS: Failed! {e}")

    print(f"\n--------------------------------------------------")
    print(f"SUMMARY: If all results are green, MeddyNet is Operational.")


if __name__ == "__main__":
    asyncio.run(verify_everything_direct())
