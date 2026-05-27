"""
MeddyNet Backend — Test Configuration
Shared fixtures for all tests.
"""

import os
from unittest.mock import AsyncMock, MagicMock

# Inject required environment variables for tests before any app code is imported
os.environ["ENVIRONMENT"] = "testing"
os.environ["RAZORPAY_KEY_ID"] = "test_key_id"
os.environ["RAZORPAY_KEY_SECRET"] = "test_key_secret"
os.environ["RAZORPAY_WEBHOOK_SECRET"] = "test_webhook_secret"
os.environ["FERNET_KEY"] = "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE="

import httpx
import pytest


# The app import must be lazy to avoid triggering DB connections in test collection
@pytest.fixture
def app():
    """Create a test instance of the FastAPI app."""
    from app.main import app

    return app


@pytest.fixture
async def client(app):
    """Create an async HTTP client for testing endpoints."""
    from httpx import ASGITransport, AsyncClient

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_db():
    """Create a mock async database session."""
    db = AsyncMock()
    db.execute = AsyncMock()
    db.commit = AsyncMock()
    db.rollback = AsyncMock()
    db.close = AsyncMock()
    return db


@pytest.fixture
def auth_headers():
    """Generate a test JWT auth header."""
    from app.services.auth_service import create_access_token

    token = create_access_token(
        {"sub": "12345678-1234-5678-1234-567812345678", "role": "patient", "phone": "+919999999999"}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    """Generate a test JWT auth header for admin."""
    from app.services.auth_service import create_access_token

    token = create_access_token(
        {"sub": "87654321-4321-8765-4321-876543210987", "role": "admin", "phone": "+919999999998"}
    )
    return {"Authorization": f"Bearer {token}"}
