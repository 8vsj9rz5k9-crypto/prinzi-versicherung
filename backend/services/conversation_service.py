from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status

from ai import document_analyzer, insurance_agent
from database import supabase_client
from models import (
    Conversation,
    ConversationCreate,
    ConversationMessage,
    ConversationUpdate,
    DocumentAnalysisRequest,
)

logger = logging.getLogger(__name__)
TABLE_NAME = "conversations"


def to_dict(model: Any, *, exclude_none: bool = False) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_none=exclude_none)
    return model.dict(exclude_none=exclude_none)


class ConversationService:
    async def create_conversation(self, payload: ConversationCreate) -> Conversation:
        logger.info("Creating %s conversation", payload.channel)
        record = to_dict(payload, exclude_none=True)
        initial_message = record.pop("initial_message", None)
        messages: list[dict[str, Any]] = []
        if initial_message:
            messages.append(to_dict(ConversationMessage(role="user", content=initial_message)))
        record["messages"] = messages
        created = await supabase_client.create(TABLE_NAME, record)
        conversation = Conversation(**created)
        if initial_message:
            return await self.send_message(conversation.id, initial_message, store_user_message=False)
        return conversation

    async def list_conversations(self, customer_id: str | None = None) -> list[Conversation]:
        filters = {"customer_id": customer_id} if customer_id else None
        records = await supabase_client.list(TABLE_NAME, filters)
        return [Conversation(**record) for record in records]

    async def get_conversation(self, conversation_id: str) -> Conversation:
        record = await supabase_client.get(TABLE_NAME, conversation_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return Conversation(**record)

    async def update_conversation(self, conversation_id: str, payload: ConversationUpdate) -> Conversation:
        updated = await supabase_client.update(TABLE_NAME, conversation_id, to_dict(payload, exclude_none=True))
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return Conversation(**updated)

    async def delete_conversation(self, conversation_id: str) -> None:
        deleted = await supabase_client.delete(TABLE_NAME, conversation_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    async def send_message(
        self,
        conversation_id: str,
        message: str,
        *,
        store_user_message: bool = True,
    ) -> Conversation:
        conversation = await self.get_conversation(conversation_id)
        history = list(conversation.messages)
        messages = list(history)
        if store_user_message:
            messages.append(ConversationMessage(role="user", content=message))
        ai_reply = await insurance_agent.process_message(history, message)
        messages.append(ConversationMessage(role="assistant", content=ai_reply))
        updated = await supabase_client.update(
            TABLE_NAME,
            conversation_id,
            {"messages": [to_dict(item) for item in messages]},
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return Conversation(**updated)

    async def analyze_document(self, conversation_id: str, payload: DocumentAnalysisRequest) -> dict[str, Any]:
        conversation = await self.get_conversation(conversation_id)
        analysis = await document_analyzer.analyze_document(payload.document_text)
        messages = list(conversation.messages)
        messages.append(
            ConversationMessage(
                role="assistant",
                content=f"Document analysis summary: {analysis['summary']}",
                metadata={"analysis": analysis},
            )
        )
        await supabase_client.update(TABLE_NAME, conversation_id, {"messages": [to_dict(item) for item in messages]})
        return analysis

    async def create_sms_conversation(self, from_number: str, message: str) -> Conversation:
        created = await supabase_client.create(
            TABLE_NAME,
            {
                "channel": "sms",
                "subject": f"SMS from {from_number}",
                "status": "active",
                "metadata": {"from_number": from_number},
                "messages": [to_dict(ConversationMessage(role="user", content=message, metadata={"from_number": from_number}))],
            },
        )
        conversation = Conversation(**created)
        return await self.send_message(conversation.id, message, store_user_message=False)


conversation_service = ConversationService()
