from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, Field

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str


class Customer(CustomerCreate):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PolicyCreate(BaseModel):
    customer_id: str
    policy_type: str
    status: str
    premium: float


class Policy(PolicyCreate):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ClaimCreate(BaseModel):
    policy_id: str
    customer_id: str
    description: str
    status: str
    amount: float


class Claim(ClaimCreate):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ConversationCreate(BaseModel):
    customer_id: str
    message: str
    channel: str = "web"


class Conversation(BaseModel):
    id: str
    customer_id: str
    message: str
    channel: str
    response: str
    source: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
