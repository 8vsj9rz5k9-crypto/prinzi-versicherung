from fastapi import APIRouter, Form
from fastapi.responses import Response
from app.models.schemas import CallRecording, VoiceCall, VoiceCallRequest
from app.services import voice_service

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/ivr", response_class=Response)
def ivr_menu() -> Response:
    """Return TwiML for the IVR main menu."""
    twiml = voice_service.generate_ivr_twiml()
    return Response(content=twiml, media_type="application/xml")


@router.post("/ivr/handle", response_class=Response)
def ivr_handle(Digits: str = Form(default="")) -> Response:  # noqa: N803 – Twilio sends "Digits"
    """Handle DTMF digit input from the IVR menu and return TwiML response."""
    twiml = voice_service.generate_dtmf_twiml(Digits)
    return Response(content=twiml, media_type="application/xml")


@router.post("/call", response_model=VoiceCall)
def initiate_call(payload: VoiceCallRequest) -> VoiceCall:
    """Initiate an outbound voice call (uses Twilio when configured, otherwise fallback)."""
    stored = voice_service.initiate_call(to=payload.to, from_=payload.from_)
    return VoiceCall(**stored)


@router.get("/recordings", response_model=list[CallRecording])
def list_recordings() -> list[CallRecording]:
    """Return all stored call recordings."""
    return [CallRecording(**r) for r in voice_service.get_recordings()]
