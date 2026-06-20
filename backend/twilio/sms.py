from __future__ import annotations

import logging
from typing import Any, Mapping

from config import settings

logger = logging.getLogger(__name__)

try:  # pragma: no cover
    from twilio.rest import Client
    from twilio.twiml.messaging_response import MessagingResponse
except ImportError:  # pragma: no cover
    Client = None  # type: ignore
    MessagingResponse = None  # type: ignore


def twilio_configured() -> bool:
    values = [settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_phone_number]
    return all(value and "your-" not in value.lower() for value in values)


def parse_incoming_sms(form_data: Mapping[str, Any]) -> dict[str, str]:
    return {
        "from_number": str(form_data.get("From", "")).strip(),
        "to_number": str(form_data.get("To", "")).strip(),
        "body": str(form_data.get("Body", "")).strip(),
        "message_sid": str(form_data.get("MessageSid", "")).strip(),
    }


def build_sms_response(message: str) -> str:
    if MessagingResponse is None:
        return f"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>{message}</Message></Response>"
    response = MessagingResponse()
    response.message(message)
    return str(response)


async def send_sms(to_number: str, message: str) -> dict[str, Any]:
    if not twilio_configured() or Client is None:
        logger.warning("Twilio credentials unavailable; simulating SMS send to %s", to_number)
        return {"status": "simulated", "to": to_number, "message": message}
    try:
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        result = client.messages.create(body=message, from_=settings.twilio_phone_number, to=to_number)
        return {"status": result.status, "sid": result.sid, "to": to_number}
    except Exception as exc:  # pragma: no cover
        logger.warning("Failed to send SMS: %s", exc)
        return {"status": "failed", "to": to_number, "error": str(exc)}
