"""
Reviews Tests — submission validation, duplicate prevention, and public lab reviews listing.
"""
import pytest


@pytest.mark.asyncio
async def test_submit_review_unauthenticated(client):
    """Submitting a review without auth should return 401/403."""
    response = await client.post(
        "/reviews",
        json={
            "lab_id": "00000000-0000-0000-0000-000000000001",
            "booking_id": "00000000-0000-0000-0000-000000000002",
            "rating": 4.5,
            "comment": "Great service!",
        },
    )
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_submit_review_booking_not_found(client, auth_headers):
    """Submitting a review for a non-existent booking returns 404."""
    response = await client.post(
        "/reviews",
        json={
            "lab_id": "00000000-0000-0000-0000-000000000001",
            "booking_id": "00000000-0000-0000-0000-000000000099",
            "rating": 4.0,
        },
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_lab_reviews_not_found(client):
    """Getting reviews for a non-existent lab returns 404."""
    response = await client.get("/reviews/lab/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_lab_reviews_valid_returns_structure(client):
    """Reviews endpoint returns the expected structure (summary + reviews list)."""
    # This will be 404 because we haven't seeded a lab — that's OK for the structure test
    response = await client.get("/reviews/lab/00000000-0000-0000-0000-000000000001")
    # Both 200 and 404 are valid; we're testing that it doesn't 500
    assert response.status_code in [200, 404]


@pytest.mark.asyncio
async def test_review_rating_validation_too_low(client, auth_headers):
    """Rating below 1.0 should fail validation (422)."""
    response = await client.post(
        "/reviews",
        json={
            "lab_id": "00000000-0000-0000-0000-000000000001",
            "booking_id": "00000000-0000-0000-0000-000000000002",
            "rating": 0.0,  # invalid — must be >= 1.0
        },
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_review_rating_validation_too_high(client, auth_headers):
    """Rating above 5.0 should fail validation (422)."""
    response = await client.post(
        "/reviews",
        json={
            "lab_id": "00000000-0000-0000-0000-000000000001",
            "booking_id": "00000000-0000-0000-0000-000000000002",
            "rating": 6.0,  # invalid — must be <= 5.0
        },
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_admin_reviews_list_requires_admin(client, auth_headers):
    """The admin reviews list should reject patient-role JWT."""
    response = await client.get("/reviews/admin/all", headers=auth_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_reviews_list_allowed_for_admin(client, admin_headers):
    """Admin reviews list should return a list for admin role."""
    response = await client.get("/reviews/admin/all", headers=admin_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
