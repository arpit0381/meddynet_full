from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.config import settings

# Resolve Connection String: Prioritize Neon for Production/Serverless
db_url = (
    settings.NEON_DATABASE_URL if settings.NEON_DATABASE_URL else settings.DATABASE_URL
)

from sqlalchemy import text
from app.utils.session_context import get_current_user_id

Base = declarative_base()

pg_engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={"ssl": True} if "neon.tech" in db_url else {},
)

# FIX 11: Module-level singleton — previously recreated on every request inside get_db()
AsyncSessionLocal = async_sessionmaker(
    pg_engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        # Resolve Context for PG RLS if needed
        user_id = get_current_user_id()
        if user_id:
            try:
                await session.execute(
                    text(f"SET LOCAL app.current_user_id = '{user_id}'")
                )
            except Exception:
                pass  # Best effort for PG session vars

        try:
            yield session
        finally:
            await session.close()


# Alias for backward compatibility with tasks and websocket handlers
SessionLocal = AsyncSessionLocal

# Alias for main.py readiness check and other consumers
engine = pg_engine
