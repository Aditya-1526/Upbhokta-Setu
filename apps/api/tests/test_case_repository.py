"""Tests for the case repository factory and Supabase-backed implementation."""
from __future__ import annotations

import sys
import types
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_row(id_="abc-123", seller="S", product="P", cat="defective",
              res="refund") -> dict:
    return {
        "id": id_,
        "product_name": product,
        "seller_name": seller,
        "purchase_date": "2025-06-01",
        "amount_inr": 100.0,
        "problem_category": cat,
        "description": "desc",
        "desired_resolution": res,
        "status": "draft",
        "created_at": "2025-06-01T00:00:00Z",
    }


# ---------------------------------------------------------------------------
# InMemoryCaseRepository tests
# ---------------------------------------------------------------------------

class TestInMemoryRepository:
    def test_create_returns_case(self):
        from app.services.case_repository import InMemoryCaseRepository
        from app.schemas.case import CaseCreate

        repo = InMemoryCaseRepository()
        payload = CaseCreate(
            product_name="Widget", seller_name="Shop",
            purchase_date="2025-01-01", amount_inr=50.0,
            problem_category="defective", description="broken",
            desired_resolution="refund",
        )
        case = repo.create(payload)
        assert case.product_name == "Widget"
        assert case.seller_name == "Shop"
        assert case.status == "draft"
        assert case.id is not None

    def test_list_returns_sorted_newest_first(self):
        from app.services.case_repository import InMemoryCaseRepository
        from app.schemas.case import CaseCreate

        repo = InMemoryCaseRepository()
        p1 = CaseCreate(product_name="A", seller_name="S",
                        purchase_date="2025-01-01", amount_inr=10,
                        problem_category="other", description="x",
                        desired_resolution="other")
        repo.create(p1)
        p2 = CaseCreate(product_name="B", seller_name="S",
                        purchase_date="2025-02-01", amount_inr=20,
                        problem_category="other", description="x",
                        desired_resolution="other")
        repo.create(p2)
        results = repo.list()
        assert len(results) == 2
        assert results[0].product_name == "B"
        assert results[1].product_name == "A"

    def test_get_existing(self):
        from app.services.case_repository import InMemoryCaseRepository
        from app.schemas.case import CaseCreate

        repo = InMemoryCaseRepository()
        payload = CaseCreate(product_name="X", seller_name="Y",
                             purchase_date="2025-01-01", amount_inr=1,
                             problem_category="other", description="z",
                             desired_resolution="other")
        created = repo.create(payload)
        found = repo.get(created.id)
        assert found is not None
        assert found.product_name == "X"

    def test_get_missing_returns_none(self):
        from app.services.case_repository import InMemoryCaseRepository
        repo = InMemoryCaseRepository()
        assert repo.get("nonexistent") is None


# ---------------------------------------------------------------------------
# Factory tests
# ---------------------------------------------------------------------------

class TestFactory:
    def test_returns_in_memory_when_no_supabase(self):
        from app.config import settings as cfg
        from app.services import case_repository as cr

        with patch.object(cfg, "supabase_url", ""):
            with patch.object(cfg, "supabase_service_role_key", ""):
                repo = cr.get_case_repository()
                assert isinstance(repo, cr.InMemoryCaseRepository)

    def test_returns_supabase_when_configured(self):
        from app.config import settings as cfg
        from app.services import case_repository as cr

        fake_url = "https://test.supabase.co"
        fake_key = "fake-service-role-key"
        with patch.object(cfg, "supabase_url", fake_url):
            with patch.object(cfg, "supabase_service_role_key", fake_key):
                with patch.object(cr, "SupabaseCaseRepository") as mock_cls:
                    repo = cr.get_case_repository()
                    mock_cls.assert_called_once_with(
                        supabase_url=fake_url, supabase_key=fake_key
                    )
                    assert repo is mock_cls.return_value


# ---------------------------------------------------------------------------
# SupabaseCaseRepository tests (mocked)
# ---------------------------------------------------------------------------

class TestSupabaseRepository:
    """The Supabase client is mocked — no real database or credentials needed."""

    @staticmethod
    def _make_repo():
        """Build a SupabaseCaseRepository with a mocked supabase client.

        We temporarily replace the ``supabase`` module in ``sys.modules`` so
        the ``from supabase import create_client`` inside
        ``SupabaseCaseRepository.__init__`` resolves to our mock.
        """
        from app.services.case_repository import SupabaseCaseRepository

        mock_client = MagicMock()
        fake_module = MagicMock()
        fake_module.create_client = MagicMock(return_value=mock_client)

        # save and replace
        real_supabase = sys.modules.get("supabase")
        sys.modules["supabase"] = fake_module  # type: ignore[assignment]
        try:
            repo = SupabaseCaseRepository(
                supabase_url="https://test.supabase.co",
                supabase_key="fake-key",
            )
        finally:
            # restore
            if real_supabase is not None:
                sys.modules["supabase"] = real_supabase  # type: ignore[assignment]
            else:
                sys.modules.pop("supabase", None)

        repo._client = mock_client
        return repo

    def test_create_maps_row_to_out(self):
        from app.schemas.case import CaseCreate
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        row = _make_row(product="Laptop", seller="TechStore")
        mock_execute = MagicMock(return_value=MagicMock(data=[row]))
        repo._client.table.return_value.insert.return_value.execute = mock_execute

        payload = CaseCreate(
            product_name="Laptop", seller_name="TechStore",
            purchase_date="2025-06-01", amount_inr=45000.0,
            problem_category="defective", description="screen flicker",
            desired_resolution="refund",
        )
        result = repo.create(payload)
        assert result.product_name == "Laptop"
        assert result.seller_name == "TechStore"
        assert result.id == "abc-123"

    def test_list_returns_cases(self):
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        rows = [_make_row(id_=f"id-{i}") for i in range(3)]
        repo._client.table.return_value.select.return_value.order.return_value.execute = (
            MagicMock(return_value=MagicMock(data=rows))
        )
        results = repo.list()
        assert len(results) == 3

    def test_get_existing(self):
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        repo._client.table.return_value.select.return_value.eq.return_value.execute = (
            MagicMock(return_value=MagicMock(data=[_make_row(id_="found")]))
        )
        found = repo.get("found")
        assert found is not None
        assert found.id == "found"

    def test_get_missing_returns_none(self):
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        repo._client.table.return_value.select.return_value.eq.return_value.execute = (
            MagicMock(return_value=MagicMock(data=[]))
        )
        assert repo.get("gone") is None

    def test_create_raises_on_empty_response(self):
        from app.schemas.case import CaseCreate
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        repo._client.table.return_value.insert.return_value.execute = (
            MagicMock(return_value=MagicMock(data=[]))
        )
        payload = CaseCreate(
            product_name="X", seller_name="Y",
            purchase_date="2025-01-01", amount_inr=10,
            problem_category="other", description="z",
            desired_resolution="other",
        )
        with pytest.raises(RuntimeError, match="Supabase insert returned no data"):
            repo.create(payload)

    def test_list_orders_by_created_at_desc(self):
        """list() chains .order('created_at', desc=True) for newest-first."""
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        repo._client.table.return_value.select.return_value.order = MagicMock()
        repo._client.table.return_value.select.return_value.order.return_value.execute = (
            MagicMock(return_value=MagicMock(data=[]))
        )
        repo.list()
        repo._client.table.return_value.select.return_value.order.assert_called_once_with(
            "created_at", desc=True
        )

    def test_get_filters_by_id(self):
        """get(case_id) chains .eq('id', case_id) for row lookup."""
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        repo._client.table.return_value.select.return_value.eq = MagicMock()
        repo._client.table.return_value.select.return_value.eq.return_value.execute = (
            MagicMock(return_value=MagicMock(data=[]))
        )
        repo.get("test-id")
        repo._client.table.return_value.select.return_value.eq.assert_called_once_with(
            "id", "test-id"
        )

    def test_factory_uses_only_url(self):
        """Factory requires both URL and service_role_key — URL alone falls back."""
        from app.config import settings as cfg
        from app.services import case_repository as cr

        with patch.object(cfg, "supabase_url", "https://test.supabase.co"):
            with patch.object(cfg, "supabase_service_role_key", ""):
                repo = cr.get_case_repository()
                assert isinstance(repo, cr.InMemoryCaseRepository)

    def test_factory_uses_only_service_role_key(self):
        """Factory requires both URL and service_role_key — key alone falls back."""
        from app.config import settings as cfg
        from app.services import case_repository as cr

        with patch.object(cfg, "supabase_url", ""):
            with patch.object(cfg, "supabase_service_role_key", "fake-key"):
                repo = cr.get_case_repository()
                assert isinstance(repo, cr.InMemoryCaseRepository)

    def test_row_to_out_handles_status_default(self):
        """Status field defaults to 'draft' when missing from row."""
        from app.services.case_repository import SupabaseCaseRepository
        from app.schemas.case import CaseStatus

        row = _make_row()
        row.pop("status")
        result = SupabaseCaseRepository._row_to_out(row)
        assert result.status == CaseStatus.DRAFT

    def test_insert_payload_shape(self):
        """The row inserted into Supabase must contain the right keys."""
        from app.schemas.case import CaseCreate
        from app.services.case_repository import SupabaseCaseRepository

        repo = self._make_repo()
        repo._client.table.return_value.insert.return_value.execute = (
            MagicMock(return_value=MagicMock(data=[_make_row()]))
        )
        payload = CaseCreate(
            product_name="Test", seller_name="Shop",
            purchase_date="2025-06-01", amount_inr=100.0,
            problem_category="defective", description="desc",
            desired_resolution="refund",
        )
        repo.create(payload)
        # Inspect what was passed to insert(...)
        insert_call = repo._client.table.return_value.insert.call_args
        row = insert_call[0][0]
        assert "product_name" in row
        assert "seller_name" in row
        assert "purchase_date" in row
        assert "amount_inr" in row
        assert "problem_category" in row
        assert "description" in row
        assert "desired_resolution" in row
        # id/created_at/updated_at/status are server-generated
        assert "id" not in row
        assert "created_at" not in row
