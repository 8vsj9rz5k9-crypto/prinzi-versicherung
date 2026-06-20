from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai import openai_client
from config import settings
from database import supabase_client
from routes import (
    auth_router,
    claims_router,
    conversations_router,
    customers_router,
    policies_router,
    twilio_webhooks_router,
)
from twilio import twilio_configured

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Insurance Agent Backend",
    version="1.0.0",
    description="FastAPI backend for customer, policy, claim, conversation, and Twilio insurance workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(policies_router)
app.include_router(claims_router)
app.include_router(conversations_router)
app.include_router(twilio_webhooks_router)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info(
        "Starting AI Insurance Agent backend | supabase=%s openai=%s twilio=%s",
        supabase_client.is_enabled,
        openai_client.is_enabled,
        twilio_configured(),
    )


@app.get("/health")
async def health_check() -> dict[str, object]:
    return {
        "status": "ok",
        "supabase_enabled": supabase_client.is_enabled,
        "openai_enabled": openai_client.is_enabled,
        "twilio_configured": twilio_configured(),
        "algorithm": settings.algorithm,
    }
