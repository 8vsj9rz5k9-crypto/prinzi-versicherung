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


# Phase 2: message history within a conversation
class MessageCreate(BaseModel):
    message: str
    rating: int | None = None  # 1-5


class Message(BaseModel):
    id: str
    conversation_id: str
    role: str  # "user" | "assistant"
    content: str
    source: str = "fallback"
    rating: int | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ConversationHistory(BaseModel):
    conversation: Conversation
    messages: list[Message]


# Phase 2: documents
class DocumentCreate(BaseModel):
    filename: str
    content_type: str = "text/plain"
    text: str


class Document(BaseModel):
    id: str
    filename: str
    content_type: str
    text: str
    summary: str = ""
    summary_source: str = "none"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DocumentAnalyzeRequest(BaseModel):
    force: bool = False


class DocumentQARequest(BaseModel):
    question: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
