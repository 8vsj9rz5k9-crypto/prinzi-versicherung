from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Form, Request, Response

from services import conversation_service
from twilio import (
    build_incoming_voice_twiml,
    build_menu_voice_twiml,
    build_recording_saved_twiml,
    build_sms_response,
    parse_incoming_sms,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/twilio", tags=["twilio"])


@router.post("/voice/incoming")
async def incoming_voice(from_number: str | None = Form(default=None, alias="From")) -> Response:
    xml = build_incoming_voice_twiml(from_number)
    return Response(content=xml, media_type="application/xml")


@router.post("/voice/menu")
async def voice_menu(digits: str | None = Form(default=None, alias="Digits")) -> Response:
    xml = build_menu_voice_twiml(digits)
    return Response(content=xml, media_type="application/xml")


@router.post("/voice/recording")
async def voice_recording(request: Request) -> Response:
    form = await request.form()
    logger.info("Received voice recording webhook with keys=%s", list(form.keys()))
    xml = build_recording_saved_twiml()
    return Response(content=xml, media_type="application/xml")


@router.post("/sms/incoming")
async def incoming_sms(request: Request) -> Response:
    form = await request.form()
    payload = parse_incoming_sms(form)
    message = payload.get("body") or ""
    if message:
        conversation = await conversation_service.create_sms_conversation(payload.get("from_number", "unknown"), message)
        reply = conversation.messages[-1].content if conversation.messages else "How can I help with your insurance question today?"
    else:
        reply = "Please send your insurance question, claim details, or policy number and I will help."
    xml = build_sms_response(reply)
    return Response(content=xml, media_type="application/xml")
