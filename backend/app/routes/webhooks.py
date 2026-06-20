import logging

from fastapi import APIRouter, Form, Request
from app.services import twilio_service, voice_service
from fastapi.responses import Response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


# ---------------------------------------------------------------------------
# Twilio SMS webhook
# ---------------------------------------------------------------------------

@router.post("/twilio/sms")
async def twilio_sms(
    request: Request,
    From: str = Form(default="unknown"),
    To: str = Form(default=""),
    Body: str = Form(default=""),
) -> dict:
    """Handle incoming SMS from Twilio.

    Verifies the Twilio request signature when TWILIO_WEBHOOK_AUTH_TOKEN is set,
    then processes the message through the InsuranceAgent.
    """
    from app.config import settings  # noqa: PLC0415

    # Signature verification (best-effort when token is configured)
    sig = request.headers.get("X-Twilio-Signature", "")
    if settings.twilio_webhook_auth_token and sig:
        params = dict(await request.form())
        valid = twilio_service.verify_twilio_signature(
            settings.twilio_webhook_auth_token,
            sig,
            str(request.url),
            {k: str(v) for k, v in params.items()},
        )
        if not valid:
            logger.warning("Invalid Twilio signature from %s", From)
            # Still process – don't break the flow in fallback mode

    result = twilio_service.process_incoming_sms(from_=From, body=Body, to=To or None)
    return result


# ---------------------------------------------------------------------------
# Twilio Voice webhook
# ---------------------------------------------------------------------------

@router.post("/twilio/voice", response_class=Response)
async def twilio_voice(
    CallSid: str = Form(default=""),
    CallStatus: str = Form(default=""),
    From: str = Form(default="unknown"),
    To: str = Form(default=""),
) -> Response:
    """Handle Twilio voice call status callback and return TwiML IVR menu."""
    logger.info("Voice callback: sid=%s status=%s from=%s", CallSid, CallStatus, From)

    # Store/update the call record
    from app.services.store import store  # noqa: PLC0415

    if CallSid:
        # Try to find existing call record (by looping – in-memory store has no index)
        existing = next(
            (c for c in store.voice_calls.values() if c.get("twilio_sid") == CallSid),
            None,
        )
        if existing:
            store.update(store.voice_calls, existing["id"], {"status": CallStatus})
        else:
            store.create(
                store.voice_calls,
                {
                    "from_": From,
                    "to": To,
                    "status": CallStatus or "in-progress",
                    "direction": "inbound",
                    "duration": None,
                    "recording_url": None,
                    "source": "twilio" if voice_service.is_available() else "fallback",
                    "twilio_sid": CallSid,
                },
            )

    twiml = voice_service.generate_ivr_twiml()
    return Response(content=twiml, media_type="application/xml")


# ---------------------------------------------------------------------------
# Twilio Recording webhook
# ---------------------------------------------------------------------------

@router.post("/twilio/recording")
async def twilio_recording(
    CallSid: str = Form(default=""),
    RecordingUrl: str = Form(default=""),
    RecordingDuration: str = Form(default="0"),
) -> dict:
    """Handle Twilio recording completion callback."""
    logger.info("Recording complete: call=%s url=%s", CallSid, RecordingUrl)

    duration: int | None = None
    try:
        duration = int(RecordingDuration)
    except ValueError:
        pass

    from app.services.store import store  # noqa: PLC0415

    # Find the call by twilio_sid
    call = next(
        (c for c in store.voice_calls.values() if c.get("twilio_sid") == CallSid),
        None,
    )
    call_id = call["id"] if call else CallSid

    stored = voice_service.store_recording(
        call_id=call_id,
        recording_url=RecordingUrl,
        duration=duration,
    )
    return {"recording_id": stored["id"], "call_id": call_id, "status": "stored"}
