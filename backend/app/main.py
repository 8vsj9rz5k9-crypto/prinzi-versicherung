from fastapi import FastAPI
from app.config import settings
from app.routes import api_router

app = FastAPI(title=settings.app_name)
app.include_router(api_router)


@app.get("/health")
def health() -> dict[str, str | dict[str, str]]:
    return {
        "status": "healthy",
        "environment": settings.environment,
        "services": {
            "openai": "configured" if settings.openai_api_key else "fallback",
            "twilio_sms": "configured" if (settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_phone_number) else "fallback",
            "twilio_voice": "configured" if (settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_phone_number) else "fallback",
        },
    }
