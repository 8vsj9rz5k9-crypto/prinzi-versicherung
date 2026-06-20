from fastapi import APIRouter, Form
from app.services.external import process_twilio_message

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/twilio/sms")
def twilio_sms(From: str = Form(default="unknown"), Body: str = Form(default="")) -> dict[str, str]:
    response, source = process_twilio_message(Body)
    return {"from": From, "message": Body, "response": response, "source": source}
