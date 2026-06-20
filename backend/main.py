from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import auth, customers, policies, claims, conversations, twilio as twilio_routes
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Prinzi Versicherung AI Insurance Agent",
    description="Full-stack AI-powered insurance operations platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "prinzi-versicherung-api"}

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])
app.include_router(claims.router, prefix="/claims", tags=["Claims"])
app.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
app.include_router(twilio_routes.router, prefix="/twilio", tags=["Twilio"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
