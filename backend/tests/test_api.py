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
            "filename": "police.txt",
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
