from __future__ import annotations

import logging
import re
from typing import Any

from ai.openai_client import openai_client

logger = logging.getLogger(__name__)

ANALYZER_PROMPT = (
    "You analyze insurance-related documents. Extract important fields, summarize coverage or incident facts, "
    "identify missing information, and recommend whether claim follow-up is appropriate. Respond in concise JSON-like prose."
)


class DocumentAnalyzer:
    async def analyze_document(self, document_text: str) -> dict[str, Any]:
        ai_response = await openai_client.analyze_text(ANALYZER_PROMPT, document_text)
        if ai_response:
            return {
                "summary": ai_response,
                "extracted_fields": self._extract_fields(document_text),
                "recommended_actions": self._recommend_actions(document_text),
                "source": "openai",
            }
        logger.info("Using local fallback document analysis.")
        return {
            "summary": self._fallback_summary(document_text),
            "extracted_fields": self._extract_fields(document_text),
            "recommended_actions": self._recommend_actions(document_text),
            "source": "local-fallback",
        }

    def _extract_fields(self, text: str) -> dict[str, Any]:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        extracted: dict[str, Any] = {
            "emails": re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text),
            "phone_numbers": re.findall(r"\+?\d[\d\s().-]{7,}\d", text),
            "currency_amounts": re.findall(r"(?:USD|\$)\s?\d[\d,]*(?:\.\d{2})?", text),
        }
        for key in ("policy number", "claim number", "incident date"):
            match = re.search(rf"{key}\s*[:#-]\s*(.+)", text, flags=re.IGNORECASE)
            if match:
                extracted[key.replace(" ", "_")] = match.group(1).strip()
        extracted["line_count"] = len(lines)
        return extracted

    def _recommend_actions(self, text: str) -> list[str]:
        lowered = text.lower()
        actions: list[str] = []
        if any(keyword in lowered for keyword in ("accident", "damage", "loss", "injury", "theft")):
            actions.append("Review whether this document supports a new or existing claim.")
        if "policy" in lowered or "coverage" in lowered:
            actions.append("Verify policy limits, deductibles, and exclusions mentioned in the document.")
        if not actions:
            actions.append("Collect missing policy, customer, and incident identifiers before proceeding.")
        return actions

    def _fallback_summary(self, text: str) -> str:
        preview = " ".join(text.split())[:400]
        return (
            "Local analysis available. The document appears to discuss insurance-related information. "
            f"Preview: {preview or 'No readable content supplied.'}"
        )


document_analyzer = DocumentAnalyzer()
