from __future__ import annotations

import logging
from typing import Any

from config import settings

logger = logging.getLogger(__name__)

try:  # pragma: no cover
    from openai import AsyncOpenAI
except ImportError:  # pragma: no cover
    AsyncOpenAI = None  # type: ignore


class OpenAIClient:
    def __init__(self) -> None:
        self._enabled = bool(settings.openai_api_key and "your-" not in settings.openai_api_key.lower())
        self._client = AsyncOpenAI(api_key=settings.openai_api_key) if self._enabled and AsyncOpenAI else None
        if self._enabled and not self._client:
            logger.warning("OpenAI SDK unavailable; AI features will use local fallback responses.")

    @property
    def is_enabled(self) -> bool:
        return self._enabled and self._client is not None

    async def chat_completion(
        self,
        system_prompt: str,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 500,
        model: str = "gpt-4o-mini",
    ) -> str | None:
        if not self.is_enabled:
            return None
        try:
            response = await self._client.chat.completions.create(  # type: ignore[union-attr]
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                messages=[{"role": "system", "content": system_prompt}, *messages],
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:  # pragma: no cover
            logger.warning("OpenAI chat completion failed: %s", exc)
            return None

    async def analyze_text(
        self,
        prompt: str,
        content: str,
        model: str = "gpt-4o-mini",
    ) -> str | None:
        return await self.chat_completion(
            system_prompt=prompt,
            messages=[{"role": "user", "content": content}],
            temperature=0.1,
            max_tokens=700,
            model=model,
        )


openai_client = OpenAIClient()
