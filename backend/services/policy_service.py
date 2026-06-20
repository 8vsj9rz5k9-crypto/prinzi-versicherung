from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status

from database import supabase_client
from models import Policy, PolicyCreate, PolicyUpdate

logger = logging.getLogger(__name__)
TABLE_NAME = "policies"
CUSTOMER_TABLE = "customers"


def to_dict(model: Any, *, exclude_none: bool = False) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_none=exclude_none)
    return model.dict(exclude_none=exclude_none)


class PolicyService:
    async def create_policy(self, payload: PolicyCreate) -> Policy:
        logger.info("Creating policy %s", payload.policy_number)
        if not await supabase_client.get(CUSTOMER_TABLE, payload.customer_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer does not exist")
        record = await supabase_client.create(TABLE_NAME, to_dict(payload))
        return Policy(**record)

    async def list_policies(self, customer_id: str | None = None) -> list[Policy]:
        logger.debug("Listing policies for customer=%s", customer_id)
        filters = {"customer_id": customer_id} if customer_id else None
        records = await supabase_client.list(TABLE_NAME, filters)
        return [Policy(**record) for record in records]

    async def get_policy(self, policy_id: str) -> Policy:
        record = await supabase_client.get(TABLE_NAME, policy_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
        return Policy(**record)

    async def update_policy(self, policy_id: str, payload: PolicyUpdate) -> Policy:
        logger.info("Updating policy %s", policy_id)
        record = await supabase_client.update(TABLE_NAME, policy_id, to_dict(payload, exclude_none=True))
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
        return Policy(**record)

    async def delete_policy(self, policy_id: str) -> None:
        logger.info("Deleting policy %s", policy_id)
        deleted = await supabase_client.delete(TABLE_NAME, policy_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")


policy_service = PolicyService()
