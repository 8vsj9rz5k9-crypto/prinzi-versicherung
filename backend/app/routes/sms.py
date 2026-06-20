from fastapi import APIRouter, HTTPException
from app.models.schemas import SMSMessage, SMSSendRequest
from app.services import twilio_service

router = APIRouter(prefix="/sms", tags=["sms"])


@router.post("/send", response_model=SMSMessage)
def send_sms(payload: SMSSendRequest) -> SMSMessage:
    """Send an SMS message (uses Twilio when configured, otherwise fallback mock)."""
    stored = twilio_service.send_sms(
        to=payload.to,
        body=payload.body,
        from_=payload.from_,
    )
    return SMSMessage(**stored)


@router.get("/history", response_model=list[SMSMessage])
def sms_history(phone: str | None = None) -> list[SMSMessage]:
    """Retrieve SMS history, optionally filtered by phone number."""
    messages = twilio_service.get_sms_history(phone=phone)
    return [SMSMessage(**m) for m in messages]
