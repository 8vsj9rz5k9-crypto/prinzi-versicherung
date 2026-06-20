"""Voice service: TwiML generation and outbound call handling with graceful fallback."""
from __future__ import annotations

import logging
import xml.etree.ElementTree as ET

import httpx

from app.config import settings
from app.services.store import store

logger = logging.getLogger(__name__)

# IVR menu options text
IVR_MENU_TEXT = (
    "Willkommen bei Prinzi Versicherung. "
    "Drücken Sie die 1 für den Policen-Status. "
    "Drücken Sie die 2 um einen Schaden zu melden. "
    "Drücken Sie die 3 um mit einem Mitarbeiter zu sprechen. "
    "Drücken Sie die 4 für häufig gestellte Fragen."
)

IVR_OPTION_TEXT: dict[str, str] = {
    "1": "Sie werden jetzt mit dem Policen-Status-Service verbunden. Bitte halten Sie Ihre Policen-Nummer bereit.",
    "2": "Sie werden jetzt zum Schadensmelde-Service weitergeleitet. Bitte beschreiben Sie Ihren Schaden nach dem Signalton.",
    "3": "Bitte warten Sie. Sie werden gleich mit einem Mitarbeiter verbunden.",
    "4": "Häufig gestellte Fragen: Für Änderungen an Ihrer Police kontaktieren Sie uns unter 0800-123456. Für Schadensmeldungen haben Sie 24 Stunden Zeit nach dem Schaden.",
}


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
# TwiML generation helpers
# ---------------------------------------------------------------------------

def _build_twiml(root_tag: str = "Response") -> ET.Element:
    return ET.Element(root_tag)


def _to_xml_str(element: ET.Element) -> str:
    return '<?xml version="1.0" encoding="UTF-8"?>' + ET.tostring(element, encoding="unicode")


def generate_ivr_twiml(ivr_base_url: str = "/voice/ivr") -> str:
    """Generate TwiML for the main IVR menu."""
    response = _build_twiml()
    gather = ET.SubElement(
        response,
        "Gather",
        numDigits="1",
        action=f"{ivr_base_url}/handle",
        method="POST",
        timeout="10",
    )
    ET.SubElement(gather, "Say", language="de-DE").text = IVR_MENU_TEXT
    # Repeat the menu if no input
    ET.SubElement(response, "Say", language="de-DE").text = (
        "Wir haben keine Eingabe erhalten. Auf Wiederhören."
    )
    ET.SubElement(response, "Hangup")
    return _to_xml_str(response)


def generate_dtmf_twiml(digit: str, ivr_base_url: str = "/voice/ivr") -> str:
    """Generate TwiML response for a DTMF digit selection."""
    response = _build_twiml()
    message = IVR_OPTION_TEXT.get(digit)
    if message:
        ET.SubElement(response, "Say", language="de-DE").text = message
    else:
        ET.SubElement(response, "Say", language="de-DE").text = (
            "Ungültige Eingabe. Bitte versuchen Sie es erneut."
        )
        # Redirect back to the IVR menu
        ET.SubElement(response, "Redirect").text = ivr_base_url
        return _to_xml_str(response)

    # After delivering the message, connect option 3 to hold music / agent queue
    if digit == "3":
        ET.SubElement(response, "Say", language="de-DE").text = "Bitte warten."
        ET.SubElement(response, "Play", loop="10").text = (
            "https://demo.twilio.com/docs/classic.mp3"
        )
    else:
        ET.SubElement(response, "Hangup")
    return _to_xml_str(response)


def generate_unavailable_twiml() -> str:
    """TwiML returned when the voice service is unavailable."""
    response = _build_twiml()
    ET.SubElement(response, "Say", language="de-DE").text = (
        "Der Sprachdienst ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut."
    )
    ET.SubElement(response, "Hangup")
    return _to_xml_str(response)


# ---------------------------------------------------------------------------
# Outbound calls
# ---------------------------------------------------------------------------

def initiate_call(to: str, from_: str | None = None, twiml_url: str | None = None) -> dict:
    """Initiate an outbound voice call; returns a stored VoiceCall dict."""
    caller = from_ or _twilio_from()
    record: dict = {
        "from_": caller,
        "to": to,
        "status": "queued",
        "direction": "outbound",
        "duration": None,
        "recording_url": None,
        "source": "fallback",
    }
    stored = store.create(store.voice_calls, record)

    if not is_available():
        logger.info("Twilio not configured – voice fallback mode active (to=%s)", to)
        store.update(store.voice_calls, stored["id"], {"status": "queued", "source": "fallback"})
        stored["source"] = "fallback"
        return stored

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Calls.json"
    url_param = twiml_url or "http://demo.twilio.com/docs/voice.xml"
    try:
        resp = httpx.post(
            url,
            data={"From": caller, "To": to, "Url": url_param},
            auth=(settings.twilio_account_sid, settings.twilio_auth_token),
            timeout=10,
        )
        if resp.is_success:
            data = resp.json()
            store.update(
                store.voice_calls,
                stored["id"],
                {"status": data.get("status", "queued"), "source": "twilio"},
            )
            stored["status"] = data.get("status", "queued")
            stored["source"] = "twilio"
            logger.info("Call initiated via Twilio sid=%s to=%s", data.get("sid"), to)
        else:
            logger.error("Twilio call error %s: %s", resp.status_code, resp.text)
            store.update(store.voice_calls, stored["id"], {"status": "failed", "source": "twilio"})
            stored["status"] = "failed"
            stored["source"] = "twilio"
    except Exception:
        logger.exception("Twilio call request failed – storing as fallback")
        store.update(store.voice_calls, stored["id"], {"status": "queued", "source": "fallback"})
        stored["source"] = "fallback"

    return stored


# ---------------------------------------------------------------------------
# Recording helpers
# ---------------------------------------------------------------------------

def store_recording(call_id: str, recording_url: str, duration: int | None = None) -> dict:
    """Persist a call recording; return the stored CallRecording dict."""
    record: dict = {
        "call_id": call_id,
        "recording_url": recording_url,
        "duration": duration,
    }
    stored = store.create(store.call_recordings, record)
    # Update parent call with recording URL
    store.update(store.voice_calls, call_id, {"recording_url": recording_url})
    return stored


def get_recordings() -> list[dict]:
    """Return all stored call recordings."""
    recordings = list(store.call_recordings.values())
    recordings.sort(key=lambda r: str(r.get("created_at", "")))
    return recordings
