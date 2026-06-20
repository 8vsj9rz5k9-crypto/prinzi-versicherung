from __future__ import annotations

import asyncio
import copy
import logging
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import uuid4

from config import settings

logger = logging.getLogger(__name__)

try:  # pragma: no cover
    from supabase import Client, create_client
except ImportError:  # pragma: no cover
    Client = Any  # type: ignore
    create_client = None  # type: ignore


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize_value(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: serialize_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    if hasattr(value, "model_dump"):
        return serialize_value(value.model_dump())
    if hasattr(value, "dict"):
        return serialize_value(value.dict())
    return value


class AsyncSupabaseClient:
    def __init__(self) -> None:
        self._client: Client | None = None
        self._memory_store: dict[str, dict[str, dict[str, Any]]] = {}
        self._lock = asyncio.Lock()
        self._enabled = False
        self._initialize_client()

    @property
    def is_enabled(self) -> bool:
        return self._enabled and self._client is not None

    def _looks_configured(self, value: str | None) -> bool:
        if not value:
            return False
        lowered = value.lower()
        return not any(token in lowered for token in ("your-", "placeholder", "example", "replace-with"))

    def _initialize_client(self) -> None:
        if create_client is None:
            logger.warning("Supabase client package is unavailable. Using in-memory datastore.")
            return
        if not (self._looks_configured(settings.supabase_url) and self._looks_configured(settings.supabase_key)):
            logger.info("Supabase credentials are not configured. Using in-memory datastore.")
            return
        try:
            self._client = create_client(settings.supabase_url, settings.supabase_key)  # type: ignore[arg-type]
            self._enabled = True
            logger.info("Supabase client initialized successfully.")
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to initialize Supabase client, falling back to memory: %s", exc)
            self._client = None
            self._enabled = False

    async def create(self, table: str, payload: dict[str, Any]) -> dict[str, Any]:
        record = serialize_value(payload)
        record.setdefault("id", str(uuid4()))
        record.setdefault("created_at", utc_now_iso())
        record["updated_at"] = utc_now_iso()
        if self.is_enabled:
            return await asyncio.to_thread(self._create_remote, table, record)
        async with self._lock:
            bucket = self._memory_store.setdefault(table, {})
            bucket[record["id"]] = copy.deepcopy(record)
            return copy.deepcopy(bucket[record["id"]])

    def _create_remote(self, table: str, payload: dict[str, Any]) -> dict[str, Any]:
        assert self._client is not None
        response = self._client.table(table).insert(payload).execute()
        data = getattr(response, "data", None) or []
        return data[0] if data else payload

    async def list(self, table: str, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        normalized_filters = serialize_value(filters or {})
        if self.is_enabled:
            return await asyncio.to_thread(self._list_remote, table, normalized_filters)
        async with self._lock:
            records = list(self._memory_store.setdefault(table, {}).values())
            if not normalized_filters:
                return copy.deepcopy(records)
            filtered = []
            for record in records:
                if all(record.get(key) == value for key, value in normalized_filters.items()):
                    filtered.append(record)
            return copy.deepcopy(filtered)

    def _list_remote(self, table: str, filters: dict[str, Any]) -> list[dict[str, Any]]:
        assert self._client is not None
        query = self._client.table(table).select("*")
        for key, value in filters.items():
            query = query.eq(key, value)
        response = query.execute()
        return getattr(response, "data", None) or []

    async def get(self, table: str, record_id: str) -> dict[str, Any] | None:
        if self.is_enabled:
            return await asyncio.to_thread(self._get_remote, table, record_id)
        async with self._lock:
            record = self._memory_store.setdefault(table, {}).get(record_id)
            return copy.deepcopy(record) if record else None

    def _get_remote(self, table: str, record_id: str) -> dict[str, Any] | None:
        assert self._client is not None
        response = self._client.table(table).select("*").eq("id", record_id).limit(1).execute()
        data = getattr(response, "data", None) or []
        return data[0] if data else None

    async def update(self, table: str, record_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        updates = serialize_value(payload)
        updates["updated_at"] = utc_now_iso()
        if self.is_enabled:
            return await asyncio.to_thread(self._update_remote, table, record_id, updates)
        async with self._lock:
            bucket = self._memory_store.setdefault(table, {})
            if record_id not in bucket:
                return None
            bucket[record_id].update(copy.deepcopy(updates))
            return copy.deepcopy(bucket[record_id])

    def _update_remote(self, table: str, record_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        assert self._client is not None
        response = self._client.table(table).update(payload).eq("id", record_id).execute()
        data = getattr(response, "data", None) or []
        return data[0] if data else None

    async def delete(self, table: str, record_id: str) -> bool:
        if self.is_enabled:
            return await asyncio.to_thread(self._delete_remote, table, record_id)
        async with self._lock:
            bucket = self._memory_store.setdefault(table, {})
            return bucket.pop(record_id, None) is not None

    def _delete_remote(self, table: str, record_id: str) -> bool:
        assert self._client is not None
        response = self._client.table(table).delete().eq("id", record_id).execute()
        data = getattr(response, "data", None) or []
        return bool(data)


supabase_client = AsyncSupabaseClient()
