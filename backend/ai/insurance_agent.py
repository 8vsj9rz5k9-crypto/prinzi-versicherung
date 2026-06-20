from __future__ import annotations

import logging
from typing import Iterable

from ai.openai_client import openai_client
from models.conversation import ConversationMessage

logger = logging.getLogger(__name__)

INSURANCE_AGENT_PROMPT = (
    "You are an AI insurance agent. Provide accurate, empathetic guidance about policies, claims, "
    "coverage, premium questions, next steps, and documents needed. Never promise coverage approval. "
    "Be clear about what information is missing and offer practical next actions."
)


class InsuranceAgent:
    async def process_message(
        self,
        history: Iterable[ConversationMessage | dict[str, str]],
        user_message: str,
    ) -> str:
        messages: list[dict[str, str]] = []
        for item in history:
            if isinstance(item, ConversationMessage):
                messages.append({"role": item.role, "content": item.content})
            else:
                messages.append({"role": str(item.get("role", "user")), "content": str(item.get("content", ""))})
        messages.append({"role": "user", "content": user_message})

        ai_response = await openai_client.chat_completion(
            system_prompt=INSURANCE_AGENT_PROMPT,
            messages=messages,
            temperature=0.2,
            max_tokens=450,
            model="gpt-4o-mini",
        )
        if ai_response:
            return ai_response
        logger.info("Using deterministic local fallback response for insurance conversation.")
        return self._fallback_response(messages, user_message)

    def _fallback_response(self, history: list[dict[str, str]], user_message: str) -> str:
        lowered = user_message.lower()
        if any(keyword in lowered for keyword in ("claim", "accident", "damage", "theft", "loss")):
            return (
                "I can help you start a claim. Please share the incident date, what happened, affected property or people, "
                "and whether emergency services were involved. If you have photos, receipts, or a police report, keep them ready."
            )
        if any(keyword in lowered for keyword in ("policy", "coverage", "covered", "deductible", "premium")):
            return (
                "I can help review your policy details. Please provide your policy number and the specific coverage question, "
                "such as deductible, limits, exclusions, or renewal timing, so I can guide you clearly."
            )
        if any(keyword in lowered for keyword in ("document", "upload", "form", "paperwork")):
            return (
                "For document support, please share the document text or describe the form. I can help identify key fields, "
                "missing information, and whether the content supports a claim or policy update."
            )
        # history[-2] is the second-to-last message (last is the new user message appended above)
        prior_item = history[-2] if len(history) > 1 else None
        prior_context = prior_item.get("content", "your request") if isinstance(prior_item, dict) else "your request"
        return (
            f"I’m here to help with insurance questions. Based on {prior_context!r}, please tell me whether you need help with "
            "a claim, policy review, billing concern, or documentation so I can suggest the next best step."
        )


insurance_agent = InsuranceAgent()
