from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query, Response, status

from models import (
    Conversation,
    ConversationCreate,
    ConversationUpdate,
    ConversationUserMessage,
    DocumentAnalysisRequest,
)
from services import AuthenticatedUser, conversation_service, get_current_user

router = APIRouter(prefix="/conversations", tags=["conversations"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=Conversation, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Conversation:
    return await conversation_service.create_conversation(payload)


@router.get("", response_model=list[Conversation])
async def list_conversations(
    customer_id: str | None = Query(default=None),
    _: AuthenticatedUser = Depends(get_current_user),
) -> list[Conversation]:
    return await conversation_service.list_conversations(customer_id=customer_id)


@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Conversation:
    return await conversation_service.get_conversation(conversation_id)


@router.put("/{conversation_id}", response_model=Conversation)
async def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Conversation:
    return await conversation_service.update_conversation(conversation_id, payload)


@router.post("/{conversation_id}/messages", response_model=Conversation)
async def send_message(
    conversation_id: str,
    payload: ConversationUserMessage,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Conversation:
    return await conversation_service.send_message(conversation_id, payload.message)


@router.post("/{conversation_id}/analyze-document", response_model=dict[str, Any])
async def analyze_document(
    conversation_id: str,
    payload: DocumentAnalysisRequest,
    _: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    return await conversation_service.analyze_document(conversation_id, payload)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Response:
    await conversation_service.delete_conversation(conversation_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
