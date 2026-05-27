"""
Full service verification - writes results to file for clean reading.
"""
import asyncio
from app.database import async_session
from sqlalchemy import text
from app.services.mongo_service import mongo_service
from app.services.auth_service import supabase_admin
from app.redis import redis_client

async def verify():
    results = []
    def log(msg=""):
        results.append(msg)
        
    log("[SYSTEM] Deep Service Connection Verification")
    log("=" * 55)

    # 1. NeonDB
    log("\n[Phase 1] NeonDB Check...")
    try:
        async with async_session() as session:
            res = await session.execute(text("SELECT VERSION()"))
            version = res.scalar()
            log(f"  [OK] NEONDB: Healthy ({version.split(',')[0]})")
    except Exception as e:
        log(f"  [FAIL] NEONDB: {e}")

    # 2. MongoDB Atlas
    log("\n[Phase 2] MongoDB Atlas Check...")
    try:
        await mongo_service.client.admin.command('ping')
        count = await mongo_service.logs.count_documents({})
        log(f"  [OK] MONGODB: Healthy (Log Count: {count})")
    except Exception as e:
        log(f"  [FAIL] MONGODB: {e}")

    # 3. Supabase Storage
    log("\n[Phase 3] Supabase Storage Check...")
    try:
        buckets = supabase_admin.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        log(f"  [OK] SUPABASE: Healthy (Buckets: {', '.join(bucket_names)})")
    except Exception as e:
        log(f"  [FAIL] SUPABASE: {e}")

    # 4. Redis
    log("\n[Phase 4] Redis Check...")
    try:
        await redis_client.ping()
        log(f"  [OK] REDIS: Healthy")
    except Exception as e:
        log(f"  [FAIL] REDIS: {e}")

    log("\n" + "=" * 55)
    
    # Count results
    ok_count = sum(1 for r in results if "[OK]" in r)
    fail_count = sum(1 for r in results if "[FAIL]" in r)
    log(f"SUMMARY: {ok_count}/4 services healthy, {fail_count}/4 failed")
    
    # Write to file
    output = "\n".join(results)
    with open("scripts/verify_results.txt", "w", encoding="utf-8") as f:
        f.write(output)
    
    # Also print (ASCII safe)
    for line in results:
        print(line)

if __name__ == "__main__":
    asyncio.run(verify())
