from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status

from models import Customer, CustomerCreate, CustomerUpdate
from services import AuthenticatedUser, customer_service, get_current_user

router = APIRouter(prefix="/customers", tags=["customers"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=Customer, status_code=status.HTTP_201_CREATED)
async def create_customer(payload: CustomerCreate, _: AuthenticatedUser = Depends(get_current_user)) -> Customer:
    return await customer_service.create_customer(payload)


@router.get("", response_model=list[Customer])
async def list_customers(_: AuthenticatedUser = Depends(get_current_user)) -> list[Customer]:
    return await customer_service.list_customers()


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, _: AuthenticatedUser = Depends(get_current_user)) -> Customer:
    return await customer_service.get_customer(customer_id)


@router.put("/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: str,
    payload: CustomerUpdate,
    _: AuthenticatedUser = Depends(get_current_user),
) -> Customer:
    return await customer_service.update_customer(customer_id, payload)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: str, _: AuthenticatedUser = Depends(get_current_user)) -> Response:
    await customer_service.delete_customer(customer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
