from fastapi.testclient import TestClient
from app.main import app
from app.services.store import store

client = TestClient(app)


def setup_function() -> None:
    store.customers.clear()
    store.policies.clear()
    store.claims.clear()
    store.conversations.clear()
    store.messages.clear()
    store.documents.clear()
    store.conversation_memory.clear()
    store.sms_messages.clear()
    store.voice_calls.clear()
    store.call_recordings.clear()
    store.sms_queue.clear()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_customer_crud() -> None:
    create = client.post("/customers", json={"name": "Max", "email": "max@example.com", "phone": "+49123"})
    assert create.status_code == 200
    customer_id = create.json()["id"]

    get_item = client.get(f"/customers/{customer_id}")
    assert get_item.status_code == 200

    update = client.put(
        f"/customers/{customer_id}",
        json={"name": "Max M", "email": "maxm@example.com", "phone": "+49124"},
    )
    assert update.status_code == 200
    assert update.json()["name"] == "Max M"

    delete = client.delete(f"/customers/{customer_id}")
    assert delete.status_code == 200
    assert delete.json()["deleted"] is True


def test_policy_claim_and_conversation_routes() -> None:
    customer = client.post("/customers", json={"name": "Ana", "email": "ana@example.com", "phone": "+49111"}).json()
    policy = client.post(
        "/policies",
        json={"customer_id": customer["id"], "policy_type": "home", "status": "active", "premium": 120.0},
    )
    assert policy.status_code == 200

    claim = client.post(
        "/claims",
        json={
            "policy_id": policy.json()["id"],
            "customer_id": customer["id"],
            "description": "Water damage",
            "status": "new",
            "amount": 3500.0,
        },
    )
    assert claim.status_code == 200

    convo = client.post("/conversations", json={"customer_id": customer["id"], "message": "Need help", "channel": "web"})
    assert convo.status_code == 200
    assert convo.json()["source"] == "fallback"


def test_auth_and_twilio_webhook() -> None:
    login = client.post("/auth/login", json={"username": "admin", "password": "password"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": "Bearer " + token})
    assert me.status_code == 200

    webhook = client.post("/webhooks/twilio/sms", data={"From": "+49001", "Body": "Hello"})
    assert webhook.status_code == 200
    assert webhook.json()["source"] == "fallback"


# ---------------------------------------------------------------------------
# Phase 2 tests
# ---------------------------------------------------------------------------

def test_conversation_history_and_messages() -> None:
    customer = client.post("/customers", json={"name": "Hans", "email": "hans@example.com", "phone": "+49222"}).json()

    convo = client.post(
        "/conversations",
        json={"customer_id": customer["id"], "message": "Wie kann ich einen Schaden melden?", "channel": "web"},
    ).json()
    convo_id = convo["id"]
    assert convo["source"] in ("openai", "fallback")

    # history endpoint
    history = client.get(f"/conversations/{convo_id}/history")
    assert history.status_code == 200
    body = history.json()
    assert body["conversation"]["id"] == convo_id
    assert isinstance(body["messages"], list)

    # add a follow-up message
    msg_resp = client.post(
        f"/conversations/{convo_id}/messages",
        json={"message": "Was brauche ich dafür?"},
    )
    assert msg_resp.status_code == 200
    data = msg_resp.json()
    assert data["role"] == "assistant"
    assert data["source"] in ("openai", "fallback")

    # 404 on unknown conversation
    assert client.get("/conversations/nonexistent/history").status_code == 404
    assert client.post("/conversations/nonexistent/messages", json={"message": "hi"}).status_code == 404


def test_document_crud_and_analysis() -> None:
    # Create via text endpoint
    doc = client.post(
        "/documents/text",
        json={
            "filename": "versicherungspolice.txt",
            "content_type": "text/plain",
            "text": "Diese Police deckt Hausrat gegen Feuer und Diebstahl ab. Deckungssumme: 50.000 EUR.",
        },
    )
    assert doc.status_code == 200
    doc_id = doc.json()["id"]
    assert doc.json()["summary"] == ""

    # list
    docs = client.get("/documents")
    assert docs.status_code == 200
    assert len(docs.json()) >= 1

    # get single
    single = client.get(f"/documents/{doc_id}")
    assert single.status_code == 200

    # analyze (will fallback since no OpenAI key in tests)
    analyzed = client.post(f"/documents/{doc_id}/analyze")
    assert analyzed.status_code == 200
    assert analyzed.json()["summary"] != ""

    # Q&A via GET
    qa = client.get(f"/documents/{doc_id}/qa", params={"question": "Was wird gedeckt?"})
    assert qa.status_code == 200
    assert qa.json()["answer"] != ""

    # Q&A via POST
    qa_post = client.post(f"/documents/{doc_id}/qa", json={"question": "Was ist die Deckungssumme?"})
    assert qa_post.status_code == 200
    assert qa_post.json()["answer"] != ""

    # delete
    deleted = client.delete(f"/documents/{doc_id}")
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] is True

    # 404 cases
    assert client.get(f"/documents/{doc_id}").status_code == 404
    assert client.post(f"/documents/{doc_id}/analyze").status_code == 404


# ---------------------------------------------------------------------------
# Phase 3 tests – SMS
# ---------------------------------------------------------------------------

def test_sms_send_fallback() -> None:
    """POST /sms/send returns a stored SMS record in fallback mode."""
    resp = client.post("/sms/send", json={"to": "+49123456789", "body": "Hallo Test"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["to"] == "+49123456789"
    assert data["body"] == "Hallo Test"
    assert data["status"] == "sent"
    assert data["source"] == "fallback"
    assert data["direction"] == "outbound"


def test_sms_history() -> None:
    """GET /sms/history returns stored SMS messages."""
    # Send two messages
    client.post("/sms/send", json={"to": "+49111", "body": "Erste Nachricht"})
    client.post("/sms/send", json={"to": "+49222", "body": "Zweite Nachricht"})

    history = client.get("/sms/history")
    assert history.status_code == 200
    assert len(history.json()) >= 2

    # Filter by phone number
    filtered = client.get("/sms/history", params={"phone": "+49111"})
    assert filtered.status_code == 200
    items = filtered.json()
    assert all(i["to"] == "+49111" or i["from_"] == "+49111" for i in items)


def test_twilio_sms_webhook_enhanced() -> None:
    """POST /webhooks/twilio/sms stores the message and returns an agent response."""
    resp = client.post("/webhooks/twilio/sms", data={"From": "+49001", "To": "+49002", "Body": "Testanfrage"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["from"] == "+49001"
    assert data["message"] == "Testanfrage"
    assert "response" in data
    assert data["source"] in ("openai", "fallback")

    # The messages should now be in history
    history = client.get("/sms/history")
    assert history.status_code == 200
    assert any(m["from_"] == "+49001" for m in history.json())


# ---------------------------------------------------------------------------
# Phase 3 tests – Voice / IVR
# ---------------------------------------------------------------------------

def test_voice_ivr_twiml() -> None:
    """GET /voice/ivr returns valid TwiML XML."""
    resp = client.get("/voice/ivr")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/xml")
    body = resp.text
    assert "<?xml" in body
    assert "<Response>" in body
    assert "<Gather" in body
    assert "Prinzi Versicherung" in body


def test_voice_ivr_handle_valid_digit() -> None:
    """POST /voice/ivr/handle returns TwiML for a valid DTMF digit."""
    for digit in ("1", "2", "3", "4"):
        resp = client.post("/voice/ivr/handle", data={"Digits": digit})
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("application/xml")
        assert "<Response>" in resp.text


def test_voice_ivr_handle_invalid_digit() -> None:
    """POST /voice/ivr/handle with invalid digit returns error TwiML."""
    resp = client.post("/voice/ivr/handle", data={"Digits": "9"})
    assert resp.status_code == 200
    assert "Ungültige Eingabe" in resp.text


def test_voice_call_fallback() -> None:
    """POST /voice/call returns a stored VoiceCall in fallback mode."""
    resp = client.post("/voice/call", json={"to": "+49987654321"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["to"] == "+49987654321"
    assert data["status"] == "queued"
    assert data["source"] == "fallback"
    assert data["direction"] == "outbound"


def test_voice_recordings() -> None:
    """GET /voice/recordings returns an empty list initially."""
    resp = client.get("/voice/recordings")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_twilio_voice_webhook() -> None:
    """POST /webhooks/twilio/voice returns TwiML IVR menu."""
    resp = client.post(
        "/webhooks/twilio/voice",
        data={"CallSid": "CA123", "CallStatus": "ringing", "From": "+49001", "To": "+49002"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/xml")
    assert "<Gather" in resp.text


def test_twilio_recording_webhook() -> None:
    """POST /webhooks/twilio/recording stores the recording."""
    resp = client.post(
        "/webhooks/twilio/recording",
        data={"CallSid": "CA999", "RecordingUrl": "https://example.com/rec.mp3", "RecordingDuration": "42"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "stored"
    assert "recording_id" in data

    # Verify it's retrievable
    recs = client.get("/voice/recordings")
    assert recs.status_code == 200
    assert any(r["recording_url"] == "https://example.com/rec.mp3" for r in recs.json())
