from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from services.auth_service import AuthenticatedUser, Token, auth_service, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    return await auth_service.login(form_data.username, form_data.password)


@router.get("/me", response_model=AuthenticatedUser)
async def read_current_user(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    return current_user
