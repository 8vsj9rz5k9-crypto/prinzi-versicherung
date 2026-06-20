from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response, status

from models import Policy, PolicyCreate, PolicyUpdate
from services import AuthenticatedUser, get_current_user, policy_service

router = APIRouter(prefix="/policies", tags=["policies"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=Policy, status_code=status.HTTP_201_CREATED)
async def create_policy(payload: PolicyCreate, _: AuthenticatedUser = Depends(get_current_user)) -> Policy:
    return await policy_service.create_policy(payload)


@router.get("", response_model=list[Policy])
async def list_policies(
    customer_id: str | None = Query(default=None),
    _: AuthenticatedUser = Depends(get_current_user),
) -> list[Policy]:
    return await policy_service.list_policies(customer_id=customer_id)


@router.get("/{policy_id}", response_model=Policy)
async def get_policy(policy_id: str, _: AuthenticatedUser = Depends(get_current_user)) -> Policy:
    return await policy_service.get_policy(policy_id)


@router.put("/{policy_id}", response_model=Policy)
async def update_policy(
    policy_id: str,
    payload: PolicyUpdate,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Policy:
    return await policy_service.update_policy(policy_id, payload)


@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(policy_id: str, _: AuthenticatedUser = Depends(get_current_user)) -> Response:
    await policy_service.delete_policy(policy_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
