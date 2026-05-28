import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_upload_report_unauthenticated(client: AsyncClient):
    """Test report upload without authentication returns 401."""
    # Assuming the API requires form-data
    response = await client.post("/reports", data={"booking_id": "test"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_my_reports_unauthenticated(client: AsyncClient):
    """Test get my reports without authentication returns 401."""
    response = await client.get("/reports/me")
    assert response.status_code == 401
