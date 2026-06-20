from collections.abc import MutableMapping
from uuid import uuid4


class MemoryStore:
    def __init__(self) -> None:
        self.customers: MutableMapping[str, dict] = {}
        self.policies: MutableMapping[str, dict] = {}
        self.claims: MutableMapping[str, dict] = {}
        self.conversations: MutableMapping[str, dict] = {}
        # Phase 2 additions
        self.messages: MutableMapping[str, dict] = {}  # keyed by message id
        self.documents: MutableMapping[str, dict] = {}
        self.conversation_memory: MutableMapping[str, list[dict]] = {}  # conversation_id -> [msg dicts]

    def create(self, table: MutableMapping[str, dict], payload: dict) -> dict:
        item_id = str(uuid4())
        record = {"id": item_id, **payload}
        table[item_id] = record
        return record

    @staticmethod
    def update(table: MutableMapping[str, dict], item_id: str, payload: dict) -> dict | None:
        current = table.get(item_id)
        if not current:
            return None
        current.update(payload)
        return current

    @staticmethod
    def delete(table: MutableMapping[str, dict], item_id: str) -> bool:
        return table.pop(item_id, None) is not None

    # ------------------------------------------------------------------
    # Conversation memory helpers
    # ------------------------------------------------------------------

    def append_message(self, conversation_id: str, role: str, content: str) -> None:
        self.conversation_memory.setdefault(conversation_id, [])
        self.conversation_memory[conversation_id].append({"role": role, "content": content})

    def get_history(self, conversation_id: str) -> list[dict]:
        return list(self.conversation_memory.get(conversation_id, []))


store = MemoryStore()
