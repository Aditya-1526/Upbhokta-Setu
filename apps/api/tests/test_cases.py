"""Tests for the cases router."""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

BASE = "http://testserver"

PAYLOAD = {
    "product_name": "Test Laptop",
    "seller_name": "TestMart",
    "purchase_date": "2025-06-01",
    "amount_inr": 45000.0,
    "problem_category": "defective",
    "description": "Screen flickers after 10 minutes.",
    "desired_resolution": "refund",
}


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        yield ac


@pytest.mark.asyncio
async def test_create_case(client: AsyncClient):
    resp = await client.post("/api/v1/cases", json=PAYLOAD)
    assert resp.status_code == 201
    body = resp.json()
    assert body["product_name"] == "Test Laptop"
    assert body["seller_name"] == "TestMart"
    assert body["status"] == "draft"
    assert "id" in body
    assert "created_at" in body


@pytest.mark.asyncio
async def test_list_cases(client: AsyncClient):
    await client.post("/api/v1/cases", json=PAYLOAD)
    await client.post("/api/v1/cases", json=PAYLOAD)

    resp = await client.get("/api/v1/cases")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 2


@pytest.mark.asyncio
async def test_get_case_detail(client: AsyncClient):
    created = (await client.post("/api/v1/cases", json=PAYLOAD)).json()
    case_id = created["id"]

    resp = await client.get(f"/api/v1/cases/{case_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == case_id
    assert body["product_name"] == "Test Laptop"


@pytest.mark.asyncio
async def test_get_case_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/cases/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_case_validation(client: AsyncClient):
    resp = await client.post("/api/v1/cases", json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_case_whitespace_rejected(client: AsyncClient):
    """Whitespace-only text fields must be rejected after validation."""
    bad = dict(PAYLOAD)
    bad["seller_name"] = "   "
    resp = await client.post("/api/v1/cases", json=bad)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_case_negative_amount_rejected(client: AsyncClient):
    bad = dict(PAYLOAD)
    bad["amount_inr"] = -100
    resp = await client.post("/api/v1/cases", json=bad)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_case_invalid_category_rejected(client: AsyncClient):
    bad = dict(PAYLOAD)
    bad["problem_category"] = "not-a-real-category"
    resp = await client.post("/api/v1/cases", json=bad)
    assert resp.status_code == 422
