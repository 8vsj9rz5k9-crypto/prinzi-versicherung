from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status

from database import supabase_client
from models import Customer, CustomerCreate, CustomerUpdate

logger = logging.getLogger(__name__)
TABLE_NAME = "customers"


def to_dict(model: Any, *, exclude_none: bool = False) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_none=exclude_none)
    return model.dict(exclude_none=exclude_none)


class CustomerService:
    async def create_customer(self, payload: CustomerCreate) -> Customer:
        logger.info("Creating customer for email=%s", payload.email)
        record = await supabase_client.create(TABLE_NAME, to_dict(payload))
        return Customer(**record)

    async def list_customers(self) -> list[Customer]:
        logger.debug("Listing customers")
        records = await supabase_client.list(TABLE_NAME)
        return [Customer(**record) for record in records]

    async def get_customer(self, customer_id: str) -> Customer:
        record = await supabase_client.get(TABLE_NAME, customer_id)
        if not record:
            logger.warning("Customer %s not found", customer_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return Customer(**record)

    async def update_customer(self, customer_id: str, payload: CustomerUpdate) -> Customer:
        logger.info("Updating customer %s", customer_id)
        record = await supabase_client.update(TABLE_NAME, customer_id, to_dict(payload, exclude_none=True))
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return Customer(**record)

    async def delete_customer(self, customer_id: str) -> None:
        logger.info("Deleting customer %s", customer_id)
        deleted = await supabase_client.delete(TABLE_NAME, customer_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")


customer_service = CustomerService()
