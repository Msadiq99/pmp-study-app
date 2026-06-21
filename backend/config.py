import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://pmp:pmp123@localhost:5432/pmp_study")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pmp-study-app-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads"))
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 200

    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "ollama_local")
    OLLAMA_LOCAL_URL: str = os.getenv("OLLAMA_LOCAL_URL", "http://localhost:11434")
    OLLAMA_CLOUD_URL: str = os.getenv("OLLAMA_CLOUD_URL", "")
    OLLAMA_CLOUD_KEY: str = os.getenv("OLLAMA_CLOUD_KEY", "")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

    @property
    def ollama_url(self) -> str:
        if self.LLM_PROVIDER == "ollama_cloud":
            return self.OLLAMA_CLOUD_URL
        return self.OLLAMA_LOCAL_URL

    class Config:
        env_file = ".env"


settings = Settings()
