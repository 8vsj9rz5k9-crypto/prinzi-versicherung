from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status

from database import supabase_client
from models import Claim, ClaimCreate, ClaimUpdate

logger = logging.getLogger(__name__)
TABLE_NAME = "claims"
POLICY_TABLE = "policies"
CUSTOMER_TABLE = "customers"


def to_dict(model: Any, *, exclude_none: bool = False) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_none=exclude_none)
    return model.dict(exclude_none=exclude_none)


class ClaimService:
    async def create_claim(self, payload: ClaimCreate) -> Claim:
        logger.info("Creating claim %s", payload.claim_number)
        if not await supabase_client.get(POLICY_TABLE, payload.policy_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Policy does not exist")
        if not await supabase_client.get(CUSTOMER_TABLE, payload.customer_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer does not exist")
        record = await supabase_client.create(TABLE_NAME, to_dict(payload))
        return Claim(**record)

    async def list_claims(self, customer_id: str | None = None, policy_id: str | None = None) -> list[Claim]:
        logger.debug("Listing claims for customer=%s policy=%s", customer_id, policy_id)
        filters = {key: value for key, value in {"customer_id": customer_id, "policy_id": policy_id}.items() if value}
        records = await supabase_client.list(TABLE_NAME, filters or None)
        return [Claim(**record) for record in records]

    async def get_claim(self, claim_id: str) -> Claim:
        record = await supabase_client.get(TABLE_NAME, claim_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return Claim(**record)

    async def update_claim(self, claim_id: str, payload: ClaimUpdate) -> Claim:
        logger.info("Updating claim %s", claim_id)
        record = await supabase_client.update(TABLE_NAME, claim_id, to_dict(payload, exclude_none=True))
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return Claim(**record)

    async def delete_claim(self, claim_id: str) -> None:
        logger.info("Deleting claim %s", claim_id)
        deleted = await supabase_client.delete(TABLE_NAME, claim_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")


claim_service = ClaimService()
