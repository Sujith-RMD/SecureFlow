from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
import logging

# Configure logging so logger.info() calls in routes.py are visible
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-12s | %(levelname)-5s | %(message)s",
    datefmt="%H:%M:%S",
)

app = FastAPI(
    title="SecureFlow API",
    description="Real-time UPI fraud prevention engine",
    version="1.2.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon demo
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
def startup():
    logging.getLogger("secureflow").info("SecureFlow engine ready — 9 rules · 4 friction tiers")

@app.get("/")
def root():
    return {"message": "SecureFlow Backend Running"}