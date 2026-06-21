from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class StudySessionResponse(BaseModel):
    id: int
    session_type: str
    duration_minutes: int
    questions_attempted: int
    questions_correct: int
    knowledge_area: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True


class StudyPlanResponse(BaseModel):
    topics: List[dict]
    recommended_order: List[str]
    estimated_hours: float
    readiness_score: float


class ChatMessage(BaseModel):
    role: str
    content: str
    sources: List[dict] = []


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class VoiceTranscript(BaseModel):
    text: str
    topic: Optional[str] = None
