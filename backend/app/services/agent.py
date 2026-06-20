"""InsuranceAgent: GPT-4o-mini powered insurance assistant with fallback."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from app.config import settings

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a helpful insurance agent assistant for Prinzi Versicherung.
You help customers with:
- Policy inquiries (coverage, premiums, terms)
- Claim processing (how to file, status, required documents)
- Document questions (explain policy documents in plain language)
- Policy recommendations (suggest appropriate coverage)
- General insurance FAQs

Always be professional, empathetic, and precise. Respond in the same language the customer uses.
If you cannot answer a question, politely redirect to a human agent.
Never invent policy details — ask clarifying questions when needed."""

FALLBACK_RESPONSES: dict[str, str] = {
    "default": (
        "Danke für Ihre Nachricht. Unser KI-Assistent ist momentan nicht verfügbar. "
        "Bitte versuchen Sie es später erneut oder wenden Sie sich an unseren Kundendienst."
    ),
    "claim": (
        "Für Ihre Schadensmeldung benötigen wir: Schadendatum, Schadensbeschreibung und Belege. "
        "Bitte kontaktieren Sie uns unter 0800-123456."
    ),
    "policy": (
        "Für Informationen zu Ihrer Police wenden Sie sich bitte an unseren Kundendienst unter 0800-123456."
    ),
    "document": (
        "Die Dokumentenanalyse ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut."
    ),
}


def _get_fallback(message: str) -> str:
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in ("schaden", "claim", "unfall")):
        return FALLBACK_RESPONSES["claim"]
    if any(kw in msg_lower for kw in ("police", "policy", "versicherung", "vertrag")):
        return FALLBACK_RESPONSES["policy"]
    return FALLBACK_RESPONSES["default"]


class InsuranceAgent:
    """Thin wrapper around the OpenAI chat completions API."""

    def __init__(self) -> None:
        self._client = None
        if settings.openai_api_key:
            try:
                from openai import OpenAI  # noqa: PLC0415

                self._client = OpenAI(api_key=settings.openai_api_key)
            except Exception:
                logger.exception("Failed to initialise OpenAI client")

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    def chat(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
        context: str | None = None,
    ) -> tuple[str, str]:
        """Return (response_text, source) where source is 'openai' or 'fallback'."""
        if not self._client:
            return _get_fallback(message), "fallback"

        messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
        if context:
            messages.append({"role": "system", "content": f"Additional context:\n{context}"})
        for item in (history or []):
            messages.append(item)
        messages.append({"role": "user", "content": message})

        try:
            completion = self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,  # type: ignore[arg-type]
                max_tokens=800,
                temperature=0.4,
            )
            text = completion.choices[0].message.content or ""
            return text, "openai"
        except Exception:
            logger.exception("OpenAI API call failed")
            return _get_fallback(message), "fallback"

    def analyze_document(self, text: str, filename: str = "") -> tuple[str, str]:
        """Summarise an insurance document; return (summary, source)."""
        if not self._client:
            return FALLBACK_RESPONSES["document"], "fallback"

        prompt = (
            f"Please analyse the following insurance document"
            f"{f' ({filename})' if filename else ''} and provide:\n"
            "1. A brief summary (2-3 sentences)\n"
            "2. Key coverage points\n"
            "3. Important exclusions or limitations\n"
            "4. Action items for the customer\n\n"
            f"Document text:\n{text[:8000]}"
        )
        try:
            completion = self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
                temperature=0.2,
            )
            text_out = completion.choices[0].message.content or ""
            return text_out, "openai"
        except Exception:
            logger.exception("OpenAI document analysis failed")
            return FALLBACK_RESPONSES["document"], "fallback"

    def answer_document_question(self, document_text: str, question: str) -> tuple[str, str]:
        """Answer a question about a document; return (answer, source)."""
        if not self._client:
            return FALLBACK_RESPONSES["document"], "fallback"

        prompt = (
            f"Based on the following insurance document, answer this question:\n"
            f"Question: {question}\n\n"
            f"Document:\n{document_text[:8000]}"
        )
        try:
            completion = self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=600,
                temperature=0.2,
            )
            text_out = completion.choices[0].message.content or ""
            return text_out, "openai"
        except Exception:
            logger.exception("OpenAI document QA failed")
            return FALLBACK_RESPONSES["document"], "fallback"


# Module-level singleton
agent = InsuranceAgent()
