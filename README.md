# prinzi-versicherung

AI-powered insurance agent with FastAPI backend and Next.js frontend. Includes SMS and Voice/IVR communication via Twilio (with graceful fallback when credentials are absent).

## Local setup

1. Copy environment file:
   - `cp .env.example .env`
2. Start with Docker:
   - `docker compose up --build`

Backend: http://localhost:8000  
Frontend: http://localhost:3000

## Manual development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API endpoints

### Core
- `GET /health`
- `POST/GET/PUT/DELETE /customers`
- `POST/GET/PUT/DELETE /policies`
- `POST/GET/PUT/DELETE /claims`
- `POST/GET/DELETE /conversations`
- `POST /auth/login`
- `GET /auth/me`

### Phase 2 – AI & Documents
- `POST /conversations/{id}/messages` – send message, get AI response
- `GET /conversations/{id}/history` – full message history
- `POST /documents/text` – create document from text
- `POST /documents` – upload document file
- `GET /documents` – list documents
- `POST /documents/{id}/analyze` – AI summarization
- `GET /documents/{id}/qa?question=…` – Q&A on document

### Phase 3 – SMS & Voice
- `POST /sms/send` – send SMS (Twilio or fallback mock)
- `GET /sms/history` – SMS history (optional `?phone=+49…` filter)
- `POST /voice/call` – initiate outbound call (Twilio or fallback)
- `GET /voice/recordings` – list call recordings
- `GET /voice/ivr` – IVR main menu TwiML
- `POST /voice/ivr/handle` – DTMF digit handler TwiML
- `POST /webhooks/twilio/sms` – incoming SMS webhook
- `POST /webhooks/twilio/voice` – voice call status webhook
- `POST /webhooks/twilio/recording` – recording completion webhook

## Example curl commands

```bash
# Send SMS (fallback mode when no Twilio credentials)
curl -X POST http://localhost:8000/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to": "+49123456789", "body": "Hallo, wie kann ich helfen?"}'

# Get IVR TwiML
curl http://localhost:8000/voice/ivr

# Initiate outbound call
curl -X POST http://localhost:8000/voice/call \
  -H "Content-Type: application/json" \
  -d '{"to": "+49123456789"}'

# Simulate incoming SMS webhook
curl -X POST http://localhost:8000/webhooks/twilio/sms \
  -d "From=%2B49111&To=%2B49222&Body=Ich+brauche+Hilfe"
```

## Environment variables

Required defaults are documented in `.env.example`:

- `APP_NAME`, `ENVIRONMENT`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `DEV_ACCESS_TOKEN`
- `OPENAI_API_KEY` (optional; fallback used when empty)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (optional; fallback used when empty)
- `TWILIO_WEBHOOK_AUTH_TOKEN` (optional; enables webhook signature verification)
- `NEXT_PUBLIC_API_BASE_URL`

## Graceful fallback behavior

When OpenAI/Twilio credentials are not configured, the backend remains fully functional:

- SMS send → stored with `status: sent`, `source: fallback`
- Voice call → stored with `status: queued`, `source: fallback`
- IVR TwiML → always generated (no credentials needed)
- Incoming SMS webhook → processed through AI agent (or fallback agent)
- All data is persisted in memory so it is available when credentials are later added

