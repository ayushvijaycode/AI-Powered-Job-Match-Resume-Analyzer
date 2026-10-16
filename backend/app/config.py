import os

DATABASE_URL = os.getenv("DATABASE_URL", "").strip() or "sqlite:///./job_match.db"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "5"))
