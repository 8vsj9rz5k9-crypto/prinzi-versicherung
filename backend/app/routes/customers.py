from fastapi import APIRouter, HTTPException
from app.models.schemas import Customer, CustomerCreate
from app.services.store import store

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=Customer)
def create_customer(payload: CustomerCreate) -> Customer:
    return Customer(**store.create(store.customers, payload.model_dump()))


@router.get("", response_model=list[Customer])
def list_customers() -> list[Customer]:
    return [Customer(**item) for item in store.customers.values()]


@router.get("/{customer_id}", response_model=Customer)
def get_customer(customer_id: str) -> Customer:
    item = store.customers.get(customer_id)
    if not item:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**item)


@router.put("/{customer_id}", response_model=Customer)
def update_customer(customer_id: str, payload: CustomerCreate) -> Customer:
    item = store.update(store.customers, customer_id, payload.model_dump())
    if not item:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**item)


@router.delete("/{customer_id}")
def delete_customer(customer_id: str) -> dict[str, bool]:
    deleted = store.delete(store.customers, customer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"deleted": True}
