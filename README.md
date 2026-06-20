# prinzi-versicherung

AI-powered insurance agent foundation with FastAPI backend and Next.js frontend.

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

- `GET /health`
- `POST/GET/PUT/DELETE /customers`
- `POST/GET/PUT/DELETE /policies`
- `POST/GET/PUT/DELETE /claims`
- `POST/GET/DELETE /conversations`
- `POST /auth/login`
- `GET /auth/me`
- `POST /webhooks/twilio/sms`

## Environment variables

Required defaults are documented in `.env.example`:

- `APP_NAME`, `ENVIRONMENT`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `DEV_ACCESS_TOKEN`
- `OPENAI_API_KEY` (optional; fallback used when empty)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` (optional; fallback used when empty)
- `NEXT_PUBLIC_API_BASE_URL`

## Graceful fallback behavior

When OpenAI/Twilio credentials are not configured, the backend still responds using local fallback responses.
