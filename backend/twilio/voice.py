from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

try:  # pragma: no cover
    from twilio.twiml.voice_response import Gather, VoiceResponse
except ImportError:  # pragma: no cover
    Gather = None  # type: ignore
    VoiceResponse = None  # type: ignore


def _basic_twiml(message: str) -> str:
    return f"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Say>{message}</Say></Response>"


def build_incoming_voice_twiml(caller: str | None = None) -> str:
    welcome = (
        f"Hello {caller}. " if caller else "Hello. "
    ) + "Welcome to the AI Insurance Agent. Press 1 to start a claim, press 2 for policy help, or stay on the line for an agent-guided recording."
    if VoiceResponse is None or Gather is None:
        logger.warning("Twilio SDK unavailable; returning basic voice XML.")
        return _basic_twiml(welcome)
    response = VoiceResponse()
    gather = Gather(num_digits=1, action="/twilio/voice/menu", method="POST", timeout=5)
    gather.say(welcome)
    response.append(gather)
    response.say("We did not receive input. Please leave a short message after the beep.")
    response.record(max_length=120, play_beep=True, transcribe=False, action="/twilio/voice/recording", method="POST")
    return str(response)


def build_menu_voice_twiml(selection: str | None) -> str:
    if VoiceResponse is None:
        return _basic_twiml("Thank you. Please leave a detailed message after the beep.")
    response = VoiceResponse()
    if selection == "1":
        response.say("You selected claims. Please describe the incident after the beep, including date, location, and damages.")
    elif selection == "2":
        response.say("You selected policy support. Please state your policy number and your question after the beep.")
    else:
        response.say("We will capture your request now. Please leave a detailed message after the beep.")
    response.record(max_length=180, play_beep=True, transcribe=False, action="/twilio/voice/recording", method="POST")
    return str(response)


def build_recording_saved_twiml() -> str:
    if VoiceResponse is None:
        return _basic_twiml("Thank you. Your message has been recorded.")
    response = VoiceResponse()
    response.say("Thank you. Your message has been recorded. Our team will review it shortly.")
    return str(response)
