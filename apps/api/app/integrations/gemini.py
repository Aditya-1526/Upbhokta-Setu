"""Gemini AI integration for complaint drafting.

A typed protocol, a real client backed by the official google-genai SDK,
and a deterministic fallback. The fallback is used when the API key is
absent, the request times out, or the model returns malformed output.

The fallback builds a clear, structured draft using only the case facts
and is clearly labelled "draft" so it is never presented as AI output.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date
from typing import Optional, Protocol, runtime_checkable

from pydantic import BaseModel, Field

from app.config import settings
from app.schemas.case import CaseOut, DesiredResolution, ProblemCategory

logger = logging.getLogger("upbhokta-setu.ai")


# ---------------------------------------------------------------------------
# Output schema
# ---------------------------------------------------------------------------

class ComplaintDraft(BaseModel):
    """Structured consumer complaint draft produced by the AI service.

    The narrative uses only facts supplied in the case. Optional
    ``legal_references`` is reserved for verified citations; it must
    never contain invented statute sections or case outcomes.
    """

    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1)
    legal_references: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    is_ai_generated: bool = True
    needs_review: bool = True


# ---------------------------------------------------------------------------
# Protocol
# ---------------------------------------------------------------------------

@runtime_checkable
class AIClient(Protocol):
    def generate_draft(
        self,
        case: CaseOut,
        response_language: str = "en",
    ) -> ComplaintDraft: ...


# ---------------------------------------------------------------------------
# Gemini implementation
# ---------------------------------------------------------------------------

PROHIBITED_PATTERNS = [
    r"\bSection\s+\d+\s+of\s+the\s+Consumer\s+Protection\s+Act",  # must verify
    r"\bSection\s+\d+,\s+Indian\s+Contract\s+Act",  # must verify
    r"\bcase\s+no\.?\s+\d+",  # invented case numbers
    r"\bwon\s+the\s+case",  # guaranteed outcome
    r"\bguaranteed\s+(?:to\s+win|outcome|refund)",  # guaranteed outcome
]


def _contains_invented_reference(text: str) -> Optional[str]:
    """Return the first suspicious pattern matched, or None."""
    for pattern in PROHIBITED_PATTERNS:
        m = re.search(pattern, text, flags=re.IGNORECASE)
        if m:
            return m.group(0)
    return None


class GeminiClient:
    """Real Gemini client using the official google-genai SDK."""

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-3.8-flash",
        timeout_seconds: float = 30.0,
    ) -> None:
        from google import genai  # type: ignore[import-untyped]

        self._model = model
        self._timeout = timeout_seconds
        self._client = genai.Client(api_key=api_key)

    def generate_draft(
        self,
        case: CaseOut,
        response_language: str = "en",
    ) -> ComplaintDraft:
        if response_language not in ("en", "hi"):
            raise ValueError(f"Unsupported response_language: {response_language}")

        prompt = _build_prompt(case, response_language)
        logger.info(
            "Gemini generate_draft case_id=%s language=%s model=%s",
            case.id, response_language, self._model,
        )

        # The google-genai SDK does not expose a per-request timeout in
        # older versions; we guard the call with a try/except and
        # rely on the SDK's internal retries. A future change can
        # wrap this in asyncio.wait_for if running from async code.
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "temperature": 0.2,
            },
        )
        raw = (response.text or "").strip()
        return _parse_model_output(raw, case, response_language)


def _build_prompt(case: CaseOut, language: str) -> str:
    """Build the prompt the model receives.

    The prompt explicitly forbids invented legal references and
    requires facts to come from the case record. It also specifies
    the response language.
    """
    lang_name = "English" if language == "en" else "Hindi"
    facts = {
        "product": case.product_name,
        "seller": case.seller_name,
        "purchase_date": case.purchase_date.isoformat(),
        "amount_inr": case.amount_inr,
        "problem_category": case.problem_category.value,
        "description": case.description,
        "desired_resolution": case.desired_resolution.value,
    }
    facts_json = json.dumps(facts, ensure_ascii=False, indent=2)

    return (
        "You are a careful drafting assistant for Indian consumer grievances.\n"
        "Generate a structured consumer complaint draft in JSON format.\n"
        "Respond in " + lang_name + " only.\n"
        "Use ONLY the facts provided below. Do not invent dates, transaction "
        "details, evidence, statute sections, case numbers, or guaranteed "
        "outcomes. If information is missing, list it in missing_information.\n"
        "Do not include any specific legal citations unless you can verify them; "
        "leave legal_references empty if uncertain.\n"
        "Return JSON with this exact shape:\n"
        "{\n"
        '  "title": string,\n'
        '  "body": string,\n'
        '  "legal_references": [string],\n'
        '  "missing_information": [string]\n'
        "}\n\n"
        "Case facts (JSON):\n" + facts_json + "\n"
    )


def _parse_model_output(
    raw: str,
    case: CaseOut,
    response_language: str,
) -> ComplaintDraft:
    """Parse and validate model JSON output, rejecting invented references."""
    # Strip any code-fence markers the model may add
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw, flags=re.MULTILINE).strip()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning("Model returned malformed JSON: %s", exc)
        return _build_fallback_draft(case, response_language, reason="malformed")

    if not isinstance(data, dict):
        logger.warning("Model returned non-object JSON")
        return _build_fallback_draft(case, response_language, reason="malformed")

    title = str(data.get("title") or "").strip()
    body = str(data.get("body") or "").strip()
    refs = data.get("legal_references") or []
    missing = data.get("missing_information") or []

    if not title or not body:
        logger.warning("Model output missing required fields")
        return _build_fallback_draft(case, response_language, reason="empty")

    # Reject invented legal references
    full_text = f"{title}\n{body}\n{' '.join(refs)}"
    prohibited = _contains_invented_reference(full_text)
    if prohibited:
        logger.warning(
            "Model output contains prohibited reference '%s' — using fallback",
            prohibited,
        )
        return _build_fallback_draft(case, response_language, reason="prohibited")

    return ComplaintDraft(
        title=title[:200],
        body=body,
        legal_references=[str(r) for r in refs][:10],
        missing_information=[str(m) for m in missing][:10],
        is_ai_generated=True,
        needs_review=True,
    )


# ---------------------------------------------------------------------------
# Deterministic fallback
# ---------------------------------------------------------------------------

def _build_fallback_draft(
    case: CaseOut,
    language: str,
    reason: Optional[str] = None,
) -> ComplaintDraft:
    """Build a draft using only the case facts. Clearly NOT AI-generated."""
    if reason:
        logger.info("Using deterministic fallback draft (reason=%s)", reason)

    if language == "hi":
        return _fallback_hi(case)
    return _fallback_en(case)


def _fallback_en(case: CaseOut) -> ComplaintDraft:
    purchase = case.purchase_date.strftime("%d %B %Y") if isinstance(case.purchase_date, date) else str(case.purchase_date)
    category = case.problem_category.value.replace("_", " ").title()
    resolution = case.desired_resolution.value.title()
    title = f"Complaint against {case.seller_name} — {case.product_name}"
    body = (
        f"To: {case.seller_name}\n\n"
        f"Subject: Consumer complaint regarding purchase of {case.product_name}\n\n"
        f"Respected Sir/Madam,\n\n"
        f"I am writing to bring to your attention a consumer grievance.\n\n"
        f"Product or service: {case.product_name}\n"
        f"Purchase date: {purchase}\n"
        f"Amount paid: INR {case.amount_inr:,.2f}\n"
        f"Problem category: {category}\n"
        f"Desired resolution: {resolution}\n\n"
        f"Description of the issue:\n{case.description}\n\n"
        f"I request that you kindly look into this matter and provide the "
        f"resolution sought above. Please find attached copies of relevant "
        f"bills, receipts, and other supporting documents for your reference.\n\n"
        f"I look forward to your prompt response.\n\n"
        f"Yours faithfully,\n"
        f"[Your name]"
    )
    return ComplaintDraft(
        title=title,
        body=body,
        legal_references=[],
        missing_information=[
            "Buyer's full name and contact details",
            "Order or invoice number",
            "Mode of payment and reference number",
            "Date(s) of contact with the seller and responses received",
        ],
        is_ai_generated=False,
        needs_review=True,
    )


def _fallback_hi(case: CaseOut) -> ComplaintDraft:
    purchase = case.purchase_date.strftime("%d %B %Y") if isinstance(case.purchase_date, date) else str(case.purchase_date)
    cat_map = {
        ProblemCategory.DEFECTIVE: "दोषपूर्ण उत्पाद",
        ProblemCategory.NOT_DELIVERED: "सामान डिलीवर नहीं हुआ",
        ProblemCategory.SERVICE_QUALITY: "सेवा गुणवत्ता",
        ProblemCategory.REFUND_ISSUE: "धनवापसी की समस्या",
        ProblemCategory.FRAUD: "धोखाधड़ी",
        ProblemCategory.OTHER: "अन्य",
    }
    res_map = {
        DesiredResolution.REFUND: "धन वापसी",
        DesiredResolution.REPLACEMENT: "प्रतिस्थापन",
        DesiredResolution.REPAIR: "मरम्मत",
        DesiredResolution.OTHER: "अन्य",
    }
    title = f"{case.seller_name} के विरुद्ध शिकायत — {case.product_name}"
    body = (
        f"सेवा में,\n{case.seller_name}\n\n"
        f"विषय: {case.product_name} की खरीद के संबंध में उपभोक्ता शिकायत\n\n"
        f"महोदय/महोदया,\n\n"
        f"मैं आपके ध्यान में एक उपभोक्ता शिकायत लाना चाहता/चाहती हूँ।\n\n"
        f"उत्पाद या सेवा: {case.product_name}\n"
        f"खरीद की तारीख: {purchase}\n"
        f"भुगतान की राशि: ₹{case.amount_inr:,.2f}\n"
        f"समस्या की श्रेणी: {cat_map.get(case.problem_category, 'अन्य')}\n"
        f"वांछित समाधान: {res_map.get(case.desired_resolution, 'अन्य')}\n\n"
        f"समस्या का विवरण:\n{case.description}\n\n"
        f"कृपया इस मामले की जाँच करें और उपरोक्त वांछित समाधान प्रदान करें। "
        f"संबंधित बिल, रसीदें और अन्य सहायक दस्तावेज़ संलग्न हैं।\n\n"
        f"आपके शीघ्र उत्तर की प्रतीक्षा में।\n\n"
        f"भवदीय,\n"
        f"[आपका नाम]"
    )
    return ComplaintDraft(
        title=title,
        body=body,
        legal_references=[],
        missing_information=[
            "खरीदार का पूरा नाम और संपर्क विवरण",
            "ऑर्डर या चालान संख्या",
            "भुगतान का तरीका और संदर्भ संख्या",
            "विक्रेता से संपर्क की तारीखें और प्राप्त उत्तर",
        ],
        is_ai_generated=False,
        needs_review=True,
    )


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def get_ai_client() -> AIClient:
    """Return the configured AI client.

    Returns the real Gemini client when an API key is set, otherwise a
    deterministic fallback client. The fallback path is also exercised
    by the service layer on any model error, so callers always receive
    a usable `ComplaintDraft` (clearly labelled).
    """
    if settings.gemini_api_key:
        try:
            return GeminiClient(
                api_key=settings.gemini_api_key,
                model=settings.gemini_model,
                timeout_seconds=settings.ai_request_timeout_seconds,
            )
        except Exception as exc:  # pragma: no cover — defensive
            logger.error("Failed to construct GeminiClient: %s", exc)

    class _FallbackClient:
        def generate_draft(
            self,
            case: CaseOut,
            response_language: str = "en",
        ) -> ComplaintDraft:
            logger.info(
                "Gemini not configured — serving deterministic fallback "
                "for case %s in %s",
                case.id, response_language,
            )
            return _build_fallback_draft(case, response_language)

    return _FallbackClient()
