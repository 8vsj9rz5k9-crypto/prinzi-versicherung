from fastapi import APIRouter, HTTPException
from app.models.schemas import Conversation, ConversationCreate
from app.services.external import generate_response
from app.services.store import store

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=Conversation)
def create_conversation(payload: ConversationCreate) -> Conversation:
    response, source = generate_response(payload.message)
    data = payload.model_dump()
    data["response"] = response
    data["source"] = source
    return Conversation(**store.create(store.conversations, data))


@router.get("", response_model=list[Conversation])
def list_conversations() -> list[Conversation]:
    return [Conversation(**item) for item in store.conversations.values()]


@router.get("/{conversation_id}", response_model=Conversation)
def get_conversation(conversation_id: str) -> Conversation:
    item = store.conversations.get(conversation_id)
    if not item:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return Conversation(**item)


@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str) -> dict[str, bool]:
    deleted = store.delete(store.conversations, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"deleted": True}
