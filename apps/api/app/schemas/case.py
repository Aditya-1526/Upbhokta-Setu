"""Case schema and Pydantic models for the grievance-cases feature."""
from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field, field_validator


class ProblemCategory(str, Enum):
    DEFECTIVE = "defective"
    NOT_DELIVERED = "not_delivered"
    SERVICE_QUALITY = "service_quality"
    REFUND_ISSUE = "refund_issue"
    FRAUD = "fraud"
    OTHER = "other"


class DesiredResolution(str, Enum):
    REFUND = "refund"
    REPLACEMENT = "replacement"
    REPAIR = "repair"
    OTHER = "other"


class CaseStatus(str, Enum):
    DRAFT = "draft"


class CaseCreate(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    seller_name: str = Field(..., min_length=1, max_length=200)
    purchase_date: date
    amount_inr: float = Field(..., ge=0)
    problem_category: ProblemCategory
    description: str = Field(..., min_length=1, max_length=2000)
    desired_resolution: DesiredResolution

    @field_validator("product_name", "seller_name", "description")
    @classmethod
    def _strip_required_text(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be empty")
        return v


class CaseOut(BaseModel):
    id: str
    product_name: str
    seller_name: str
    purchase_date: date
    amount_inr: float
    problem_category: ProblemCategory
    description: str
    desired_resolution: DesiredResolution
    status: CaseStatus
    created_at: datetime


class DraftResponse(BaseModel):
    title: str
    body: str
    language: str
    is_ai_generated: bool
    needs_review: bool
    legal_references: List[str]
    missing_information: List[str]
    case_id: str


def make_case_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
