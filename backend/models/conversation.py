from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ConversationMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(..., min_length=1)
    timestamp: datetime = Field(default_factory=utc_now)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ConversationBase(BaseModel):
    customer_id: str | None = None
    channel: str = Field(default="web", min_length=2, max_length=30)
    subject: str | None = Field(default=None, max_length=200)
    status: str = Field(default="active", min_length=2, max_length=50)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ConversationCreate(ConversationBase):
    initial_message: str | None = Field(default=None, max_length=2000)


class ConversationUpdate(BaseModel):
    subject: str | None = Field(default=None, max_length=200)
    status: str | None = Field(default=None, min_length=2, max_length=50)
    metadata: dict[str, Any] | None = None


class Conversation(ConversationBase):
    id: str
    messages: list[ConversationMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class ConversationUserMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)


class DocumentAnalysisRequest(BaseModel):
    document_text: str = Field(..., min_length=1, max_length=100000)
