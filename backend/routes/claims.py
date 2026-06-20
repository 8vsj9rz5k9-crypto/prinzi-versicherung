from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response, status

from models import Claim, ClaimCreate, ClaimUpdate
from services import AuthenticatedUser, claim_service, get_current_user

router = APIRouter(prefix="/claims", tags=["claims"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=Claim, status_code=status.HTTP_201_CREATED)
async def create_claim(payload: ClaimCreate, _: AuthenticatedUser = Depends(get_current_user)) -> Claim:
    return await claim_service.create_claim(payload)


@router.get("", response_model=list[Claim])
async def list_claims(
    customer_id: str | None = Query(default=None),
    policy_id: str | None = Query(default=None),
    _: AuthenticatedUser = Depends(get_current_user),
) -> list[Claim]:
    return await claim_service.list_claims(customer_id=customer_id, policy_id=policy_id)


@router.get("/{claim_id}", response_model=Claim)
async def get_claim(claim_id: str, _: AuthenticatedUser = Depends(get_current_user)) -> Claim:
    return await claim_service.get_claim(claim_id)


@router.put("/{claim_id}", response_model=Claim)
async def update_claim(
    claim_id: str,
    payload: ClaimUpdate,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Claim:
    return await claim_service.update_claim(claim_id, payload)


@router.delete("/{claim_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_claim(claim_id: str, _: AuthenticatedUser = Depends(get_current_user)) -> Response:
    await claim_service.delete_claim(claim_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
