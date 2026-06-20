from fastapi import APIRouter, HTTPException
from app.models.schemas import Policy, PolicyCreate
from app.services.store import store

router = APIRouter(prefix="/policies", tags=["policies"])


@router.post("", response_model=Policy)
def create_policy(payload: PolicyCreate) -> Policy:
    return Policy(**store.create(store.policies, payload.model_dump()))


@router.get("", response_model=list[Policy])
def list_policies() -> list[Policy]:
    return [Policy(**item) for item in store.policies.values()]


@router.get("/{policy_id}", response_model=Policy)
def get_policy(policy_id: str) -> Policy:
    item = store.policies.get(policy_id)
    if not item:
        raise HTTPException(status_code=404, detail="Policy not found")
    return Policy(**item)


@router.put("/{policy_id}", response_model=Policy)
def update_policy(policy_id: str, payload: PolicyCreate) -> Policy:
    item = store.update(store.policies, policy_id, payload.model_dump())
    if not item:
        raise HTTPException(status_code=404, detail="Policy not found")
    return Policy(**item)


@router.delete("/{policy_id}")
def delete_policy(policy_id: str) -> dict[str, bool]:
    deleted = store.delete(store.policies, policy_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"deleted": True}
