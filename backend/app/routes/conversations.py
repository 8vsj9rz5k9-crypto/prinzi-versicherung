from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    Conversation,
    ConversationCreate,
    ConversationHistory,
    Message,
    MessageCreate,
)
from app.services.external import generate_response
from app.services.store import store

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=Conversation)
def create_conversation(payload: ConversationCreate) -> Conversation:
    # New conversation starts without prior history
    response, source = generate_response(payload.message)
    data = payload.model_dump()
    data["response"] = response
    data["source"] = source
    conversation = Conversation(**store.create(store.conversations, data))
    # Seed conversation memory with the opening exchange
    store.append_message(conversation.id, "user", payload.message)
    store.append_message(conversation.id, "assistant", response)
    return conversation


@router.get("", response_model=list[Conversation])
def list_conversations() -> list[Conversation]:
    return [Conversation(**item) for item in store.conversations.values()]


@router.get("/{conversation_id}", response_model=Conversation)
def get_conversation(conversation_id: str) -> Conversation:
    item = store.conversations.get(conversation_id)
    if not item:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return Conversation(**item)


@router.get("/{conversation_id}/history", response_model=ConversationHistory)
def get_conversation_history(conversation_id: str) -> ConversationHistory:
    item = store.conversations.get(conversation_id)
    if not item:
        raise HTTPException(status_code=404, detail="Conversation not found")
    raw_messages = [
        msg for msg in store.messages.values() if msg.get("conversation_id") == conversation_id
    ]
    raw_messages.sort(key=lambda m: m.get("created_at", ""))
    messages = [Message(**m) for m in raw_messages]
    return ConversationHistory(conversation=Conversation(**item), messages=messages)


@router.post("/{conversation_id}/messages", response_model=Message)
def add_message(conversation_id: str, payload: MessageCreate) -> Message:
    conversation = store.conversations.get(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    history = store.get_history(conversation_id)
    response_text, source = generate_response(payload.message, history=history)

    # Store user message
    user_msg_data = {
        "conversation_id": conversation_id,
        "role": "user",
        "content": payload.message,
        "source": "user",
        "rating": None,
    }
    store.create(store.messages, user_msg_data)

    # Store assistant message
    assistant_msg_data = {
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": response_text,
        "source": source,
        "rating": None,
    }
    assistant_record = store.create(store.messages, assistant_msg_data)

    # Update conversation memory
    store.append_message(conversation_id, "user", payload.message)
    store.append_message(conversation_id, "assistant", response_text)

    return Message(**assistant_record)


@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str) -> dict[str, bool]:
    deleted = store.delete(store.conversations, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    store.conversation_memory.pop(conversation_id, None)
    return {"deleted": True}
