"""Case repository abstraction.

A common interface is defined so the FastAPI routers do not change when
the backing store switches from in-memory (development) to Supabase
(production).  The concrete implementation is selected at import time
based on whether Supabase credentials are present in the environment.
"""
from __future__ import annotations

import logging
import threading
from enum import Enum
from typing import Protocol, Optional, List, runtime_checkable

from app.schemas.case import CaseCreate, CaseOut, make_case_id, utcnow

logger = logging.getLogger("upbhokta-setu.cases")


def _enum_val(v: object) -> str:
    """Return the string value for an Enum, or the value itself if not."""
    return v.value if isinstance(v, Enum) else str(v)


# ---------------------------------------------------------------------------
# Protocol
# ---------------------------------------------------------------------------

@runtime_checkable
class CaseRepository(Protocol):
    """Interface every case store must satisfy."""

    def create(self, payload: CaseCreate) -> CaseOut: ...
    def list(self) -> List[CaseOut]: ...
    def get(self, case_id: str) -> Optional[CaseOut]: ...


# ---------------------------------------------------------------------------
# In-memory implementation (local-dev fallback)
# ---------------------------------------------------------------------------

class InMemoryCaseRepository:
    """Thread-safe in-memory store.  Not for production use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._by_id: dict[str, CaseOut] = {}

    def create(self, payload: CaseCreate) -> CaseOut:
        with self._lock:
            case = CaseOut(
                id=make_case_id(),
                product_name=payload.product_name,
                seller_name=payload.seller_name,
                purchase_date=payload.purchase_date,
                amount_inr=payload.amount_inr,
                problem_category=payload.problem_category,
                description=payload.description,
                desired_resolution=payload.desired_resolution,
                status="draft",
                created_at=utcnow(),
            )
            self._by_id[case.id] = case
            logger.info("Created case %s (%s, %s)", case.id, case.seller_name, case.product_name)
            return case

    def list(self) -> List[CaseOut]:
        with self._lock:
            items = list(self._by_id.values())
        items.sort(key=lambda c: c.created_at, reverse=True)
        return items

    def get(self, case_id: str) -> Optional[CaseOut]:
        with self._lock:
            return self._by_id.get(case_id)


# ---------------------------------------------------------------------------
# Supabase implementation
# ---------------------------------------------------------------------------

class SupabaseCaseRepository:
    """Supabase PostgREST-backed case store.

    Requires `supabase_url` and `supabase_anon_key` to be set in the
    application configuration.  The service-role key is used for
    server-side writes so that RLS policies on the `anon` role do not
    block inserts.
    """

    def __init__(
        self,
        supabase_url: str,
        supabase_key: str,
    ) -> None:
        from supabase import create_client  # type: ignore[import-untyped]
        self._client = create_client(supabase_url, supabase_key)

    def create(self, payload: CaseCreate) -> CaseOut:
        row: dict = {
            "product_name": payload.product_name,
            "seller_name": payload.seller_name,
            "purchase_date": payload.purchase_date.isoformat(),
            "amount_inr": payload.amount_inr,
            "problem_category": _enum_val(payload.problem_category),
            "description": payload.description,
            "desired_resolution": _enum_val(payload.desired_resolution),
        }
        result = self._client.table("cases").insert(row).execute()
        if not result.data:
            raise RuntimeError("Supabase insert returned no data")
        db_row = result.data[0]
        return CaseOut(
            id=db_row["id"],
            product_name=db_row["product_name"],
            seller_name=db_row["seller_name"],
            purchase_date=db_row["purchase_date"],
            amount_inr=db_row["amount_inr"],
            problem_category=db_row["problem_category"],
            description=db_row["description"],
            desired_resolution=db_row["desired_resolution"],
            status=db_row.get("status", "draft"),
            created_at=db_row["created_at"],
        )

    def list(self) -> List[CaseOut]:
        result = (
            self._client.table("cases")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return [self._row_to_out(r) for r in result.data]

    def get(self, case_id: str) -> Optional[CaseOut]:
        try:
            result = (
                self._client.table("cases")
                .select("*")
                .eq("id", case_id)
                .execute()
            )
        except Exception:
            # PostgREST raises on invalid UUIDs or other query errors;
            # treat as "not found" for a single-row lookup.
            return None
        if not result.data:
            return None
        return self._row_to_out(result.data[0])

    @staticmethod
    def _row_to_out(row: dict) -> CaseOut:
        return CaseOut(
            id=row["id"],
            product_name=row["product_name"],
            seller_name=row["seller_name"],
            purchase_date=row["purchase_date"],
            amount_inr=row["amount_inr"],
            problem_category=row["problem_category"],
            description=row["description"],
            desired_resolution=row["desired_resolution"],
            status=row.get("status", "draft"),
            created_at=row["created_at"],
        )


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def get_case_repository() -> CaseRepository:
    """Return the configured case repository.

    If Supabase credentials are present in the environment, a
    `SupabaseCaseRepository` is returned.  Otherwise the
    `InMemoryCaseRepository` is used and an informational log line is
    emitted.  Callers should check the log output if persistence is
    unexpectedly missing.
    """
    from app.config import settings

    if settings.supabase_url and settings.supabase_service_role_key:
        logger.info("Using SupabaseCaseRepository at %s", settings.supabase_url)
        return SupabaseCaseRepository(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_service_role_key,
        )

    logger.warning(
        "Supabase not configured — using InMemoryCaseRepository "
        "(data lost on restart). Set SUPABASE_URL and "
        "SUPABASE_SERVICE_ROLE_KEY to enable persistence."
    )
    return InMemoryCaseRepository()


# The single instance used by the API routers.  Tests may replace this.
case_repository: CaseRepository = get_case_repository()
