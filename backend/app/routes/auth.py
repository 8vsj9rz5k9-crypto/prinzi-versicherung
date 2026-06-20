from secrets import token_urlsafe
from fastapi import APIRouter, Depends, Header, HTTPException
from app.config import settings
from app.models.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])
issued_tokens: set[str] = set()


def require_user(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1]
    if token != settings.dev_access_token and token not in issued_tokens:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return settings.admin_username


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    if payload.username != settings.admin_username or payload.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = settings.dev_access_token or token_urlsafe(24)
    issued_tokens.add(token)
    return TokenResponse(access_token=token)


@router.get("/me")
def me(user: str = Depends(require_user)) -> dict[str, str]:
    return {"username": user}
