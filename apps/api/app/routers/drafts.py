"""AI draft generation — POST /api/v1/cases/{case_id}/draft."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.case import DraftResponse
from app.services.draft_service import draft_service

router = APIRouter(prefix="/cases", tags=["drafts"])


def _to_dict(result) -> dict:
    """Accept either a Draft object or a plain dict (useful in tests)."""
    if hasattr(result, "to_dict"):
        return result.to_dict()
    if isinstance(result, dict):
        return result
    raise TypeError(
        f"draft_service.generate must return Draft or dict, got {type(result).__name__}"
    )


@router.post(
    "/{case_id}/draft",
    response_model=DraftResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Draft generated or fallback returned"},
        404: {"description": "Case not found"},
        422: {"description": "Invalid query parameters"},
    },
)
def generate_draft(
    case_id: str,
    response_language: str = Query("en", pattern="^[eh][ni]$"),
) -> DraftResponse:
    result = draft_service.generate(
        case_id=case_id,
        response_language=response_language,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return DraftResponse(**_to_dict(result))
