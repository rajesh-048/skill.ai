import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "SkillSphere AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    TAGLINE: str = "Know Your Gaps. Learn Smarter. Grow Faster."
    ORGANIZATION: str = "Ministry of Statistics and Programme Implementation (MoSPI)"
    PROBLEM_ID: str = "SIH26101"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "skillsphere-ai-sih26101-enterprise-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI Service
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    MIMO_MODEL: str = os.getenv("MIMO_MODEL", "xiaomi/mimo-v2.5-pro")
    DEMO_MODE: bool = True  # Always fallback safely when key is missing or offline
    
    # Database
    DATABASE_PATH: str = str(DATA_DIR / "skillsphere.db")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".docx", ".txt"]

settings = Settings()
