import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.services.mongo_service import mongo_service
from app.services.auth_service import supabase_admin
from app.redis import redis_client
from app.config import settings
import time

router = APIRouter(prefix="/diagnostics", tags=["System Diagnostics"])
logger = logging.getLogger(__name__)


@router.get("/")
async def run_diagnostics(db: AsyncSession = Depends(get_db)):
    """
    Performs a deep health check across all infrastructure layers.
    Checks: NeonDB (Postgres), MongoDB Atlas, Supabase Storage, and Redis.
    """
    results = {
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT,
        "services": {},
    }

    # 1. NeonDB (PostgreSQL)
    try:
        start = time.time()
        # Verify connectivity and RLS context
        res = await db.execute(text("SELECT current_user, VERSION()"))
        user, version = res.fetchone()
        results["services"]["postgresql"] = {
            "status": "healthy",
            "latency_ms": round((time.time() - start) * 1000, 2),
            "details": {"user": user, "version": version.split(",")[0]},
        }
    except Exception as e:
        results["services"]["postgresql"] = {"status": "unhealthy", "error": str(e)}

    # 2. MongoDB Atlas
    try:
        start = time.time()
        # Ping the server to check connectivity and SSL handshake
        await mongo_service.client.admin.command("ping")
        log_count = await mongo_service.logs.count_documents({})
        results["services"]["mongodb"] = {
            "status": "healthy",
            "latency_ms": round((time.time() - start) * 1000, 2),
            "details": {"log_count": log_count},
        }
    except Exception as e:
        results["services"]["mongodb"] = {"status": "unhealthy", "error": str(e)}

    # 3. Supabase Storage
    try:
        start = time.time()
        # List buckets to verify Service Role key and Storage connectivity
        buckets = supabase_admin.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        results["services"]["supabase_storage"] = {
            "status": "healthy",
            "latency_ms": round((time.time() - start) * 1000, 2),
            "details": {"buckets": bucket_names},
        }
    except Exception as e:
        results["services"]["supabase_storage"] = {
            "status": "unhealthy",
            "error": str(e),
        }

    # 4. Redis (Upstash/Local)
    try:
        start = time.time()
        await redis_client.ping()
        results["services"]["redis"] = {
            "status": "healthy",
            "latency_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        results["services"]["redis"] = {"status": "unhealthy", "error": str(e)}

    # Overall Status Summary
    all_healthy = all(s["status"] == "healthy" for s in results["services"].values())
    results["overall_status"] = "operational" if all_healthy else "degraded"

    return results
