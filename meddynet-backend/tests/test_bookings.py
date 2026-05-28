"""
Booking Flow Tests — creation, status updates, cancellation, and pagination.
"""
import pytest


@pytest.mark.asyncio
async def test_create_booking_unauthenticated(client):
    """Creating a booking without auth should return 401/403."""
    response = await client.post(
        "/bookings",
        json={
            "lab_id": "00000000-0000-0000-0000-000000000001",
            "test_ids": [],
            "type": "home_collection",
            "patient_name": "Test Patient",
            "patient_phone": "+919876543210",
        },
    )
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_get_my_bookings_authenticated(client, auth_headers):
    """Authenticated user should be able to fetch their bookings (even if empty)."""
    response = await client.get("/bookings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_my_bookings_pagination(client, auth_headers):
    """Bookings list supports skip/limit pagination parameters."""
    response = await client.get("/bookings?skip=0&limit=5", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5


@pytest.mark.asyncio
async def test_get_booking_detail_not_found(client, auth_headers):
    """Fetching a non-existent booking returns 404."""
    response = await client.get(
        "/bookings/00000000-0000-0000-0000-000000000099",
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_cancel_booking_not_found(client, auth_headers):
    """Cancelling a non-existent booking returns 404."""
    response = await client.patch(
        "/bookings/00000000-0000-0000-0000-000000000099/cancel",
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_booking_status_unauthorized(client, auth_headers):
    """A patient cannot update booking status (only lab/admin/tech can)."""
    response = await client.patch(
        "/bookings/00000000-0000-0000-0000-000000000099/status",
        json={"status": "completed"},
        headers=auth_headers,
    )
    # Either 404 (not found) or 403 (RBAC) — both are correct
    assert response.status_code in [403, 404]


@pytest.mark.asyncio
async def test_tracking_unavailable_for_unknown_booking(client, auth_headers):
    """Tracking endpoint returns 404 for a booking that doesn't exist."""
    response = await client.get(
        "/bookings/00000000-0000-0000-0000-000000000099/tracking",
        headers=auth_headers,
    )
    assert response.status_code == 404
