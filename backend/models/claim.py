from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ClaimBase(BaseModel):
    policy_id: str
    customer_id: str
    claim_number: str = Field(..., min_length=3, max_length=100)
    incident_date: date
    reported_date: date | None = None
    status: str = Field(default="submitted", min_length=2, max_length=50)
    description: str = Field(..., min_length=10, max_length=4000)
    claimed_amount: Decimal = Field(default=Decimal("0"), ge=0)
    approved_amount: Decimal | None = Field(default=None, ge=0)
    notes: str | None = Field(default=None, max_length=2000)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ClaimCreate(ClaimBase):
    pass


class ClaimUpdate(BaseModel):
    incident_date: date | None = None
    reported_date: date | None = None
    status: str | None = Field(default=None, min_length=2, max_length=50)
    description: str | None = Field(default=None, min_length=10, max_length=4000)
    claimed_amount: Decimal | None = Field(default=None, ge=0)
    approved_amount: Decimal | None = Field(default=None, ge=0)
    notes: str | None = Field(default=None, max_length=2000)
    metadata: dict[str, Any] | None = None


class Claim(ClaimBase):
    id: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
