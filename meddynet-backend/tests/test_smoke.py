"""
Smoke Tests — Basic endpoint availability checks.
These tests verify the API responds without crashing on core routes.
"""
import pytest


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """Health check should return 200 with status ok."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data


@pytest.mark.asyncio
async def test_discovery_endpoint(client):
    """Discovery should return portal URLs."""
    response = await client.get("/discovery")
    assert response.status_code == 200
    data = response.json()
    assert "lab" in data
    assert "admin" in data
    assert "technician" in data
    assert "patient" in data


@pytest.mark.asyncio
async def test_unauthenticated_bookings_returns_401(client):
    """Bookings endpoint should reject unauthenticated requests."""
    response = await client.get("/bookings")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_unauthenticated_admin_stats_returns_401(client):
    """Admin stats should reject unauthenticated requests."""
    response = await client.get("/admin/stats")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_unauthenticated_payments_returns_401(client):
    """Payments endpoint should reject unauthenticated requests."""
    response = await client.get("/payments/me")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_labs_list_returns_200(client):
    """Labs list is a public endpoint and should return 200."""
    response = await client.get("/labs")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_validation_error_format(client):
    """POST to auth with invalid body should return 422 with proper format."""
    response = await client.post("/auth/send-otp", json={})
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
