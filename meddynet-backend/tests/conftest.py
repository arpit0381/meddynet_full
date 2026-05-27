"""
MeddyNet Backend — Test Configuration
Shared fixtures for all tests.
"""
import pytest
import httpx
from unittest.mock import AsyncMock, MagicMock

# The app import must be lazy to avoid triggering DB connections in test collection
@pytest.fixture
def app():
    """Create a test instance of the FastAPI app."""
    from app.main import app
    return app

@pytest.fixture
async def client(app):
    """Create an async HTTP client for testing endpoints."""
    from httpx import AsyncClient, ASGITransport
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
    token = create_access_token({"sub": "test-user-uuid", "role": "patient", "phone": "+919999999999"})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers():
    """Generate a test JWT auth header for admin."""
    from app.services.auth_service import create_access_token
    token = create_access_token({"sub": "test-admin-uuid", "role": "admin", "phone": "+919999999998"})
    return {"Authorization": f"Bearer {token}"}
