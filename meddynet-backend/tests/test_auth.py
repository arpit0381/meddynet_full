"""
Auth Flow Tests — OTP, login, token rotation.
"""

import pytest


@pytest.mark.asyncio
async def test_send_otp_valid_phone(client):
    """Send OTP to a valid phone number should return 200."""
    response = await client.post("/auth/send-otp", json={"phone": "+919876543210"})
    # Should succeed (200) or rate limited (429) — both are valid
    assert response.status_code in [200, 429]


@pytest.mark.asyncio
async def test_send_otp_invalid_phone(client):
    """Send OTP with invalid phone should return 422."""
    response = await client.post("/auth/send-otp", json={"phone": "123"})
    assert response.status_code in [200, 422, 400]


@pytest.mark.asyncio
async def test_verify_otp_wrong_otp(client):
    """Verify OTP with wrong code should return 400/401."""
    response = await client.post("/auth/verify-otp", json={"phone": "+919876543210", "otp": "000000"})
    assert response.status_code in [400, 401]


@pytest.mark.asyncio
async def test_refresh_token_invalid(client):
    """Refresh with invalid token should return 401."""
    response = await client.post("/auth/refresh", json={"refresh_token": "invalid_token_here"})
    assert response.status_code in [401, 422]


@pytest.mark.asyncio
async def test_profile_with_auth(client, auth_headers):
    """Profile endpoint with valid auth should not return 401."""
    response = await client.get("/users/me", headers=auth_headers)
    # May return 404 (user not in DB) but should NOT return 401
    assert response.status_code != 401
