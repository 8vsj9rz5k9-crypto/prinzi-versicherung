from app.config import settings


def generate_response(message: str) -> tuple[str, str]:
    if settings.openai_api_key:
        return f"AI service unavailable locally. Stored message: {message}", "fallback"
    return f"Fallback response: {message}", "fallback"


def process_twilio_message(body: str) -> tuple[str, str]:
    if settings.twilio_account_sid and settings.twilio_auth_token:
        return f"Twilio service unavailable locally. Received: {body}", "fallback"
    return f"Fallback SMS response: {body}", "fallback"
