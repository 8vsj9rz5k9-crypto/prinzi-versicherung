# Prinzi Versicherung AI Insurance Agent

Prinzi Versicherung is a full-stack AI insurance operations platform with a FastAPI backend, a Next.js frontend, OpenAI-powered assistance, Supabase-backed persistence, and Twilio communication workflows.

## Overview

The system is designed for insurance teams that need a single workspace for:
- customer portfolio management
- policy and claim lifecycle tracking
- AI-assisted customer conversations
- insurance document analysis
- voice and SMS intake via Twilio
- internal dashboards and admin workflows

The repository includes safe local fallbacks so the application can run without live OpenAI, Supabase, or Twilio credentials during development.

## Architecture

### Backend (`backend/`)
- **Framework:** FastAPI
- **Configuration:** environment-driven settings with `.env`
- **Auth:** JWT token flow with a development-safe fallback user
- **Persistence:** Supabase client with automatic in-memory fallback for local/dev mode
- **AI services:** conversation agent and document analyzer with graceful local fallback responses
- **Communications:** Twilio voice IVR, call recording support, SMS send/receive helpers
- **Structure:** models, services, routes, database, AI, and Twilio modules separated by responsibility

### Frontend (`frontend/`)
- **Framework:** Next.js 13 pages router with React 18 and TypeScript
- **Styling:** Tailwind CSS
- **State/data:** React Query, typed service layer, reusable hooks
- **UX:** responsive layout, sidebar navigation, cards, tables, notifications, conversation UI, phone dialer
- **Runtime behavior:** works with live backend APIs when configured or safe mock data when not configured

## Repository Layout

```text
backend/      FastAPI application
frontend/     Next.js application
docker-compose.yml
.env.example  root environment template
```

## Setup

### 1. Clone and configure

```bash
git clone <repository-url>
cd prinzi-versicherung
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Fill in real values in your local `.env`, `backend/.env`, and `frontend/.env.local` files. Never commit real credentials.

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

```bash
curl http://localhost:8000/health
```

### 3. Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

Open `http://localhost:3000`.

## Docker Compose

Create a local `.env` from `.env.example`, then run:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Environment Variables

### Root / backend variables
| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase API key |
| `OPENAI_API_KEY` | OpenAI API key for AI conversation and document analysis |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number used for outbound communication |
| `SECRET_KEY` | JWT signing secret |
| `ALGORITHM` | JWT signing algorithm, default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifetime in minutes |

### Frontend variables
| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the FastAPI backend |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key |
| `NEXT_PUBLIC_SOCKET_URL` | Optional realtime endpoint |

## Development Authentication

The backend ships with a local fallback login for development when no external identity layer is connected.

- **Email:** `admin@example.com`
- **Password:** `ChangeMe123!`

Set a strong `SECRET_KEY` and replace or extend authentication before production deployment.

## API Summary

### Health
- `GET /health`

### Authentication
- `POST /auth/token`
- `GET /auth/me`

### Customers
- `GET /customers`
- `POST /customers`
- `GET /customers/{customer_id}`
- `PUT /customers/{customer_id}`
- `DELETE /customers/{customer_id}`

### Policies
- `GET /policies`
- `POST /policies`
- `GET /policies/{policy_id}`
- `PUT /policies/{policy_id}`
- `DELETE /policies/{policy_id}`

### Claims
- `GET /claims`
- `POST /claims`
- `GET /claims/{claim_id}`
- `PUT /claims/{claim_id}`
- `DELETE /claims/{claim_id}`

### Conversations
- `GET /conversations`
- `POST /conversations`
- `GET /conversations/{conversation_id}`
- `PUT /conversations/{conversation_id}`
- `DELETE /conversations/{conversation_id}`
- `POST /conversations/{conversation_id}/messages`
- `POST /conversations/{conversation_id}/analyze-document`

### Twilio Webhooks
- `POST /twilio/voice`
- `POST /twilio/voice/handle-menu`
- `POST /twilio/voice/recording-status`
- `POST /twilio/sms`

## Deployment Guide

### Backend deployment
1. Provision a Python 3.11 runtime.
2. Install `backend/requirements.txt`.
3. Set environment variables.
4. Run `uvicorn main:app --host 0.0.0.0 --port 8000` from `backend/`.
5. Place the app behind a reverse proxy or managed ingress with HTTPS.

### Frontend deployment
1. Provision a Node.js 20 runtime.
2. Run `npm install` and `npm run build` in `frontend/`.
3. Set the `NEXT_PUBLIC_*` environment variables.
4. Run `npm run start`.
5. Point the frontend to the deployed backend URL.

### Production hardening checklist
- replace placeholder secrets and keys
- set a strong `SECRET_KEY`
- use managed Supabase tables and Row Level Security policies
- connect Twilio webhooks to public HTTPS endpoints
- add centralized logging and monitoring
- configure CORS to trusted origins only
- replace development fallback auth with your production identity provider

## Validation

The implementation was validated during build work with:
- Python module compilation for `backend/`
- TypeScript type-checking for `frontend/`
- Next.js production build for `frontend/`

## Notes

- `.env.example` files only contain placeholders.
- The backend and frontend both degrade gracefully when third-party services are not configured.
- The frontend can demonstrate the user experience with mock-safe data even without a running backend.
