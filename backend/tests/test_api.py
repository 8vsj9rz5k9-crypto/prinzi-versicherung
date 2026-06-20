from fastapi.testclient import TestClient
from app.main import app
from app.services.store import store

client = TestClient(app)


def setup_function() -> None:
    store.customers.clear()
    store.policies.clear()
    store.claims.clear()
    store.conversations.clear()


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
