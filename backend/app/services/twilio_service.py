"""Twilio SMS service with graceful fallback when credentials are missing."""
from __future__ import annotations

import hashlib
import hmac
import logging
from base64 import b64encode

import httpx

from app.config import settings
from app.services.agent import agent
from app.services.store import store

logger = logging.getLogger(__name__)


def is_available() -> bool:
    """Return True when all required Twilio credentials are configured."""
    return bool(
        settings.twilio_account_sid
        and settings.twilio_auth_token
        and settings.twilio_phone_number
    )


def _twilio_from() -> str:
    return settings.twilio_phone_number or "+10000000000"


# ---------------------------------------------------------------------------
# SMS sending
# ---------------------------------------------------------------------------

def send_sms(to: str, body: str, from_: str | None = None) -> dict:
    """Send an SMS message; returns a stored SMSMessage dict.

    When Twilio credentials are not configured the message is stored with
    status='sent' and source='fallback' so the system keeps working.
    """
    sender = from_ or _twilio_from()
    record: dict = {
        "from_": sender,
        "to": to,
        "body": body,
        "direction": "outbound",
        "status": "queued",
        "source": "fallback",
    }
    stored = store.create(store.sms_messages, record)

    if not is_available():
        logger.info("Twilio not configured – SMS fallback mode active (to=%s)", to)
        store.update(store.sms_messages, stored["id"], {"status": "sent", "source": "fallback"})
        stored["status"] = "sent"
        stored["source"] = "fallback"
        return stored

    # Try real Twilio REST API
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    try:
        resp = httpx.post(
            url,
            data={"From": sender, "To": to, "Body": body},
            auth=(settings.twilio_account_sid, settings.twilio_auth_token),
            timeout=10,
        )
        if resp.is_success:
            data = resp.json()
            store.update(
                store.sms_messages,
                stored["id"],
                {"status": data.get("status", "sent"), "source": "twilio"},
            )
            stored["status"] = data.get("status", "sent")
            stored["source"] = "twilio"
            logger.info("SMS sent via Twilio sid=%s to=%s", data.get("sid"), to)
        else:
            logger.error("Twilio SMS error %s: %s", resp.status_code, resp.text)
            store.update(store.sms_messages, stored["id"], {"status": "failed", "source": "twilio"})
            stored["status"] = "failed"
            stored["source"] = "twilio"
    except Exception:
        logger.exception("Twilio SMS request failed – storing as fallback")
        store.update(store.sms_messages, stored["id"], {"status": "sent", "source": "fallback"})
        stored["status"] = "sent"
        stored["source"] = "fallback"

    return stored


# ---------------------------------------------------------------------------
# Incoming SMS (webhook payload)
# ---------------------------------------------------------------------------

def process_incoming_sms(from_: str, body: str, to: str | None = None) -> dict:
    """Process an incoming SMS from Twilio webhook; returns the agent response dict."""
    to = to or _twilio_from()
    # Persist the inbound message
    record: dict = {
        "from_": from_,
        "to": to,
        "body": body,
        "direction": "inbound",
        "status": "received",
        "source": "twilio" if is_available() else "fallback",
    }
    store.create(store.sms_messages, record)

    # Generate agent response and send it back
    response_text, source = agent.chat(body)

    # Store outbound reply
    reply_record: dict = {
        "from_": to,
        "to": from_,
        "body": response_text,
        "direction": "outbound",
        "status": "queued",
        "source": source,
    }
    reply_stored = store.create(store.sms_messages, reply_record)

    if is_available():
        try:
            send_sms(from_, response_text, from_=to)
            store.update(store.sms_messages, reply_stored["id"], {"status": "sent"})
        except Exception:
            logger.exception("Failed to send SMS reply via Twilio")
    else:
        store.update(store.sms_messages, reply_stored["id"], {"status": "sent", "source": "fallback"})

    return {"from": from_, "message": body, "response": response_text, "source": source}


# ---------------------------------------------------------------------------
# SMS history
# ---------------------------------------------------------------------------

def get_sms_history(phone: str | None = None) -> list[dict]:
    """Return all stored SMS messages, optionally filtered by phone number."""
    messages = list(store.sms_messages.values())
    if phone:
        messages = [m for m in messages if m.get("from_") == phone or m.get("to") == phone]
    messages.sort(key=lambda m: str(m.get("created_at", "")))
    return messages


# ---------------------------------------------------------------------------
# Webhook signature verification
# ---------------------------------------------------------------------------

def verify_twilio_signature(auth_token: str, signature: str, url: str, params: dict) -> bool:
    """Validate the X-Twilio-Signature header for webhook security.

    See https://www.twilio.com/docs/usage/webhooks/webhooks-security
    """
    if not auth_token:
        return True  # Skip verification when token is not configured

    # Build the string to sign: URL + sorted POST params
    s = url + "".join(f"{k}{v}" for k, v in sorted(params.items()))
    expected = b64encode(
        hmac.new(auth_token.encode(), s.encode(), hashlib.sha1).digest()
    ).decode()
    return hmac.compare_digest(expected, signature)
