from app.config import settings
from app.services.agent import agent


def generate_response(message: str, history: list[dict[str, str]] | None = None) -> tuple[str, str]:
    return agent.chat(message, history=history)


def process_twilio_message(body: str) -> tuple[str, str]:
    if settings.twilio_account_sid and settings.twilio_auth_token:
        return agent.chat(body)
    return agent.chat(body)
