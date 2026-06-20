from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from config import settings

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
DEFAULT_SECRET_KEY = settings.secret_key or "local-development-secret"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str | None = None


class AuthenticatedUser(BaseModel):
    username: str
    full_name: str
    roles: list[str]
    disabled: bool = False


LOCAL_USERS = {
    "admin@example.com": {
        "username": "admin@example.com",
        "full_name": "Local Insurance Admin",
        "roles": ["admin"],
        "disabled": False,
        "hashed_password": pwd_context.hash("ChangeMe123!"),
    }
}


class AuthService:
    def __init__(self) -> None:
        if not settings.secret_key:
            logger.warning("SECRET_KEY is not set. Using a development-only fallback secret.")

    async def authenticate_user(self, username: str, password: str) -> AuthenticatedUser | None:
        user = LOCAL_USERS.get(username.lower())
        if not user:
            logger.warning("Login attempt for unknown user %s", username)
            return None
        if not pwd_context.verify(password, user["hashed_password"]):
            logger.warning("Invalid password for user %s", username)
            return None
        return AuthenticatedUser(
            username=user["username"],
            full_name=user["full_name"],
            roles=user["roles"],
            disabled=user["disabled"],
        )

    def create_access_token(self, subject: str, expires_delta: timedelta | None = None) -> str:
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
        payload = {"sub": subject, "exp": expire}
        return jwt.encode(payload, DEFAULT_SECRET_KEY, algorithm=settings.algorithm)

    async def login(self, username: str, password: str) -> Token:
        user = await self.authenticate_user(username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = self.create_access_token(subject=user.username)
        return Token(access_token=token)

    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> AuthenticatedUser:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload: dict[str, Any] = jwt.decode(token, DEFAULT_SECRET_KEY, algorithms=[settings.algorithm])
            username = payload.get("sub")
            if not username:
                raise credentials_exception
        except JWTError as exc:
            logger.warning("JWT decode failed: %s", exc)
            raise credentials_exception from exc
        user = LOCAL_USERS.get(str(username).lower())
        if not user or user.get("disabled"):
            raise credentials_exception
        return AuthenticatedUser(
            username=user["username"],
            full_name=user["full_name"],
            roles=list(user["roles"]),
            disabled=bool(user["disabled"]),
        )


auth_service = AuthService()


async def get_current_user(token: str = Depends(oauth2_scheme)) -> AuthenticatedUser:
    return await auth_service.get_current_user(token)
