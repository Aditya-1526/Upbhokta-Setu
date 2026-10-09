"""Service layer for AI-assisted complaint draft generation.

Encapsulates: case lookup, AI invocation, fallback on failure, and
output validation. The router is kept thin.
"""
from __future__ import annotations

import logging
from typing import Optional

from app.integrations.gemini import (
    AIClient,
    ComplaintDraft,
    _build_fallback_draft,
    get_ai_client,
)
from app.schemas.case import CaseOut
from app.services.case_repository import case_repository

logger = logging.getLogger("upbhokta-setu.drafts")


class DraftService:
    def __init__(self, ai_client: Optional[AIClient] = None) -> None:
        # Allow injection for tests; default to the configured client.
        self._ai = ai_client if ai_client is not None else get_ai_client()

    def generate(
        self,
        case_id: str,
        response_language: str = "en",
    ) -> Optional["Draft"]:
        """Look up a case and return a complaint draft. None if case missing."""
        if response_language not in ("en", "hi"):
            response_language = "en"

        case: Optional[CaseOut] = case_repository.get(case_id)
        if case is None:
            logger.info("Draft requested for missing case %s", case_id)
            return None

        try:
            draft_obj = self._ai.generate_draft(case, response_language)
        except Exception as exc:
            # Any error from the model — timeout, auth, network, etc.
            # Fall back to a deterministic draft. Never raise to the user.
            logger.warning(
                "AI generation failed for case %s (%s) — falling back",
                case_id, exc,
            )
            draft_obj = _build_fallback_draft(case, response_language)

        return Draft.from_model(draft_obj, case_id, response_language)


class Draft:
    """Public response object returned to the mobile client."""

    def __init__(
        self,
        title: str,
        body: str,
        language: str,
        is_ai_generated: bool,
        needs_review: bool,
        legal_references: list[str],
        missing_information: list[str],
        case_id: str,
    ) -> None:
        self.title = title
        self.body = body
        self.language = language
        self.is_ai_generated = is_ai_generated
        self.needs_review = needs_review
        self.legal_references = legal_references
        self.missing_information = missing_information
        self.case_id = case_id

    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "body": self.body,
            "language": self.language,
            "is_ai_generated": self.is_ai_generated,
            "needs_review": self.needs_review,
            "legal_references": self.legal_references,
            "missing_information": self.missing_information,
            "case_id": self.case_id,
        }

    @classmethod
    def from_model(
        cls,
        obj: ComplaintDraft,
        case_id: str,
        language: str,
    ) -> "Draft":
        return cls(
            title=obj.title,
            body=obj.body,
            language=language,
            is_ai_generated=obj.is_ai_generated,
            needs_review=obj.needs_review,
            legal_references=obj.legal_references,
            missing_information=obj.missing_information,
            case_id=case_id,
        )


# Single shared instance — tests may patch draft_service._ai directly.
draft_service = DraftService()
