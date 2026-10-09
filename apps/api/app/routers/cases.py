"""Cases router — POST to create, GET to list/detail."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.case import CaseCreate, CaseOut
from app.services.case_repository import case_repository

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post(
    "",
    response_model=CaseOut,
    status_code=status.HTTP_201_CREATED,
)
def create_case(payload: CaseCreate) -> CaseOut:
    return case_repository.create(payload)


@router.get("", response_model=list[CaseOut])
def list_cases() -> list[CaseOut]:
    return case_repository.list()


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: str) -> CaseOut:
    case = case_repository.get(case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return case
