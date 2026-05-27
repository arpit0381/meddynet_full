from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.redis import limiter
from app.middleware.auth_middleware import AuthMiddleware

from app.routers import (
    auth,
    users,
    labs,
    bookings,
    technicians,
    payments,
    webhooks,
    reports,
    notifications,
    lab_portal,
    technician_portal,
    admin_portal,
    payouts,
    diagnostics,
    health_records,
)

from app.websocket import router as ws_router
from app.services.mongo_service import mongo_service

import logging

logger = logging.getLogger(__name__)


# FIX 12: Replaced deprecated @app.on_event("startup") with lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to databases and initialize indexes on startup."""
    await mongo_service.initialize_indexes()
    yield
    # Shutdown logic (if any) goes here


app = FastAPI(
    title="MeddyNet Backend API",
    version="1.0.0",
    description="Unified API Gateway powering MeddyNet's suite of Next.js 16 frontends.",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )


# Auth context mapping
app.add_middleware(AuthMiddleware)


# Global Request/Error Audit Logging to MongoDB
# FIX 1: Restructured try/except with finally so duration is always calculated
@app.middleware("http")
async def audit_logging_middleware(request, call_next):
    import time

    start_time = time.time()
    response = None
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Unhandled exception on {request.url.path}", exc_info=True)
        raise e
    finally:
        duration = time.time() - start_time
        # Log slow requests (> 2s) — non-blocking
        if duration > 2.0:
            try:
                await mongo_service.log_event(
                    level="warning",
                    event="slow_request",
                    message=f"Slow request to {request.url.path}",
                    context={
                        "duration": duration,
                        "method": request.method,
                        "path": request.url.path,
                    },
                )
            except Exception:
                pass  # Never block a request due to logging failure

    return response


# CORS Policy (Added LAST to ensure it is the OUTERMOST middleware)
# This MUST wrap all other middlewares to ensure CORS headers on all responses, including errors.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list
    + [
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(lab_portal.router)
app.include_router(labs.router)
app.include_router(bookings.router)
app.include_router(technicians.router)
app.include_router(payments.router)
app.include_router(webhooks.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(technician_portal.router)
app.include_router(admin_portal.router)
app.include_router(payouts.router)
app.include_router(diagnostics.router)
app.include_router(health_records.router)


# WebSocket global mount
app.include_router(ws_router)


@app.get("/health")
async def health_check():
    """Basic liveness probe."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/ready")
async def readiness_check():
    """Deep readiness probe — checks DB and Redis connectivity."""
    checks = {"postgres": False, "redis": False, "mongo": False}

    # Postgres
    try:
        from app.database import get_db, engine
        from sqlalchemy import text

        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["postgres"] = True
    except Exception as e:
        logger.error(f"Readiness: Postgres check failed: {e}")

    # Redis
    try:
        from app.redis import redis_client

        await redis_client.ping()
        checks["redis"] = True
    except Exception as e:
        logger.error(f"Readiness: Redis check failed: {e}")

    # MongoDB
    try:
        from app.services.mongo_service import mongo_service

        if mongo_service.db is not None:
            await mongo_service.db.command("ping")
            checks["mongo"] = True
    except Exception as e:
        logger.error(f"Readiness: MongoDB check failed: {e}")

    all_ok = all(checks.values())
    return {
        "status": "ready" if all_ok else "degraded",
        "checks": checks,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/discovery")
async def portal_discovery():
    """
    Dynamic Portal Discovery Service for 10000% Resilient Navigation.
    """
    return {
        "lab": settings.LAB_PORTAL_URL,
        "admin": settings.ADMIN_PORTAL_URL,
        "technician": settings.TECHNICIAN_PORTAL_URL,
        "patient": settings.PATIENT_PORTAL_URL,
    }
