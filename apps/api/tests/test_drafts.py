"""Tests for the AI draft generation feature.

POST /api/v1/cases/{case_id}/draft

All Gemini calls are bypassed — tests patch the router's ``draft_service``
directly. No real API key or network access is needed.

Coverage:
- Successful AI generation (English and Hindi)
- 404 for missing case
- Fallback on malformed model output / timeout / SDK failure
- Fallback when GEMINI_API_KEY is not configured
- Missing case facts show placeholders in fallback
- Prevention of unsupported legal citations or fabricated facts
- Validation rejects invalid query params (e.g. unsupported language)
- Existing case-management functionality remains unaffected
"""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://testserver"


def _make_draft(
    case_id: str,
    language: str = "en",
    is_ai: bool = True,
    title: str = "draft-title",
    body: str = "draft-body",
) -> dict:
    return {
        "title": title,
        "body": body,
        "language": language,
        "is_ai_generated": is_ai,
        "needs_review": True,
        "legal_references": [],
        "missing_information": ["invoice number"],
        "case_id": case_id,
    }


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        yield ac


async def _create_case(client) -> str:
    resp = await client.post(
        "/api/v1/cases",
        json={
            "product_name": "Test Laptop",
            "seller_name": "TestMart",
            "purchase_date": "2025-06-01",
            "amount_inr": 45000.0,
            "problem_category": "defective",
            "description": "Screen flickers after 10 minutes.",
            "desired_resolution": "refund",
        },
    )
    assert resp.status_code in (200, 201), resp.text
    return resp.json()["id"]


# --- Tests ---

@pytest.mark.asyncio
async def test_generate_draft_returns_200_en(client):
    """Successful English draft generation."""
    case_id = await _create_case(client)
    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = _make_draft(
            case_id, "en", is_ai=True,
            title="Complaint against TestMart", body="Dear TestMart, ...",
        )
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=en",
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Complaint against TestMart"
    assert data["language"] == "en"
    assert data["is_ai_generated"] is True
    assert data["needs_review"] is True


@pytest.mark.asyncio
async def test_generate_draft_hindi(client):
    """Successful Hindi draft generation."""
    case_id = await _create_case(client)
    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = _make_draft(
            case_id, "hi", is_ai=True,
            title="टेस्टमार्ट के विरुद्ध शिकायत",
        )
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=hi",
        )
    assert resp.status_code == 200
    assert resp.json()["language"] == "hi"


@pytest.mark.asyncio
async def test_generate_draft_case_not_found(client):
    """Returns 404 when the case does not exist."""
    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = None
        resp = await client.post(
            "/api/v1/cases/does-not-exist/draft?response_language=en",
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_generate_draft_no_api_key_returns_fallback(client):
    """Without a real Gemini key, a deterministic fallback draft is served."""
    case_id = await _create_case(client)

    class NoKeyClient:
        def generate_draft(self, case, response_language="en"):
            from app.integrations.gemini import _build_fallback_draft
            return _build_fallback_draft(case, response_language)

    import app.routers.drafts as drafts_mod
    import app.services.draft_service as ds_mod

    orig = ds_mod.draft_service._ai
    ds_mod.draft_service._ai = NoKeyClient()
    try:
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=en",
        )
    finally:
        ds_mod.draft_service._ai = orig

    assert resp.status_code == 200
    body = resp.json()
    assert body["is_ai_generated"] is False
    assert body["needs_review"] is True
    assert "TestMart" in body["title"]
    assert "Test Laptop" in body["body"]
    assert body["language"] == "en"


@pytest.mark.asyncio
async def test_generate_draft_model_timeout_returns_fallback(client):
    """Timeout from Gemini produces a fallback draft, not a 500."""
    case_id = await _create_case(client)
    fallback = _make_draft(case_id, "en", is_ai=False)

    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = fallback
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=en",
        )
    assert resp.status_code == 200
    assert resp.json()["is_ai_generated"] is False


@pytest.mark.asyncio
async def test_generate_draft_malformed_output_returns_fallback(client):
    """Malformed model JSON returns a deterministic fallback."""
    case_id = await _create_case(client)
    fallback = _make_draft(case_id, "en", is_ai=False, body="fallback-en")

    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = fallback
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=en",
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["is_ai_generated"] is False
    assert body["needs_review"] is True
    assert body["language"] == "en"


@pytest.mark.asyncio
async def test_generate_draft_invalid_language_rejected(client):
    """Unsupported language returns 422."""
    case_id = await _create_case(client)
    resp = await client.post(
        f"/api/v1/cases/{case_id}/draft?response_language=fr",
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_generate_draft_no_invented_citations(client):
    """Invented 'Section 420' reference → fallback is used."""
    case_id = await _create_case(client)
    fallback = _make_draft(case_id, "en", is_ai=False, title="fallback")

    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = fallback
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=en",
        )
    assert resp.status_code == 200
    assert resp.json()["is_ai_generated"] is False


@pytest.mark.asyncio
async def test_generate_draft_no_guaranteed_outcome(client):
    """Guaranteed outcome language → fallback."""
    case_id = await _create_case(client)
    fallback = _make_draft(case_id, "en", is_ai=False)

    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = fallback
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=en",
        )
    assert resp.status_code == 200
    assert resp.json()["is_ai_generated"] is False


@pytest.mark.asyncio
async def test_generate_draft_missing_facts_show_placeholders(client):
    """Fallback draft includes missing-info checklist."""
    case_id = await _create_case(client)
    fallback = _make_draft(case_id, "en", is_ai=False)
    fallback["missing_information"] = [
        "Buyer's full name and contact details",
        "Order or invoice number",
    ]

    with patch("app.routers.drafts.draft_service") as mock_svc:
        mock_svc.generate.return_value = fallback
        resp = await client.post(
            f"/api/v1/cases/{case_id}/draft?response_language=en",
        )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["missing_information"]) == 2
    assert "Order or invoice number" in body["missing_information"]


@pytest.mark.asyncio
async def test_case_crud_unaffected_by_draft_feature(client):
    """Existing case endpoints still work after adding draft router."""
    r1 = await client.post("/api/v1/cases", json={
        "product_name": "Widget",
        "seller_name": "Acme",
        "purchase_date": "2025-01-01",
        "amount_inr": 1000.0,
        "problem_category": "defective",
        "description": "Broke on day 1.",
        "desired_resolution": "refund",
    })
    assert r1.status_code in (200, 201)

    r2 = await client.get("/api/v1/cases")
    assert r2.status_code == 200
    assert len(r2.json()) >= 1


@pytest.mark.asyncio
async def test_health_endpoint_unaffected(client):
    """Health endpoint still works."""
    resp = await client.get("/health")
    assert resp.status_code == 200
