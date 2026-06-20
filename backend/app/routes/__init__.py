from fastapi import APIRouter
from app.routes import auth, claims, conversations, customers, documents, policies, sms, voice, webhooks

api_router = APIRouter()
api_router.include_router(customers.router)
api_router.include_router(policies.router)
api_router.include_router(claims.router)
api_router.include_router(conversations.router)
api_router.include_router(documents.router)
api_router.include_router(sms.router)
api_router.include_router(voice.router)
api_router.include_router(auth.router)
api_router.include_router(webhooks.router)
