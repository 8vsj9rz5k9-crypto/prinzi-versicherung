from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PolicyBase(BaseModel):
    customer_id: str
    policy_number: str = Field(..., min_length=3, max_length=100)
    policy_type: str = Field(..., min_length=2, max_length=100)
    status: str = Field(default="active", min_length=2, max_length=50)
    coverage_amount: Decimal = Field(default=Decimal("0"), ge=0)
    premium_amount: Decimal = Field(default=Decimal("0"), ge=0)
    deductible_amount: Decimal = Field(default=Decimal("0"), ge=0)
    effective_date: date
    expiration_date: date
    details: dict[str, Any] = Field(default_factory=dict)


class PolicyCreate(PolicyBase):
    pass


class PolicyUpdate(BaseModel):
    policy_number: str | None = Field(default=None, min_length=3, max_length=100)
    policy_type: str | None = Field(default=None, min_length=2, max_length=100)
    status: str | None = Field(default=None, min_length=2, max_length=50)
    coverage_amount: Decimal | None = Field(default=None, ge=0)
    premium_amount: Decimal | None = Field(default=None, ge=0)
    deductible_amount: Decimal | None = Field(default=None, ge=0)
    effective_date: date | None = None
    expiration_date: date | None = None
    details: dict[str, Any] | None = None


class Policy(PolicyBase):
    id: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
