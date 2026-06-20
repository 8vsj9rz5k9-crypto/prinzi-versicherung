from fastapi import APIRouter, HTTPException
from app.models.schemas import Claim, ClaimCreate
from app.services.store import store

router = APIRouter(prefix="/claims", tags=["claims"])


@router.post("", response_model=Claim)
def create_claim(payload: ClaimCreate) -> Claim:
    return Claim(**store.create(store.claims, payload.model_dump()))


@router.get("", response_model=list[Claim])
def list_claims() -> list[Claim]:
    return [Claim(**item) for item in store.claims.values()]


@router.get("/{claim_id}", response_model=Claim)
def get_claim(claim_id: str) -> Claim:
    item = store.claims.get(claim_id)
    if not item:
        raise HTTPException(status_code=404, detail="Claim not found")
    return Claim(**item)


@router.put("/{claim_id}", response_model=Claim)
def update_claim(claim_id: str, payload: ClaimCreate) -> Claim:
    item = store.update(store.claims, claim_id, payload.model_dump())
    if not item:
        raise HTTPException(status_code=404, detail="Claim not found")
    return Claim(**item)


@router.delete("/{claim_id}")
def delete_claim(claim_id: str) -> dict[str, bool]:
    deleted = store.delete(store.claims, claim_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"deleted": True}
