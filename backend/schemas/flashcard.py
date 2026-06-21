from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FlashcardCreate(BaseModel):
    front: str
    back: str
    knowledge_area: Optional[str] = None
    document_id: Optional[int] = None


class FlashcardResponse(BaseModel):
    id: int
    front: str
    back: str
    knowledge_area: Optional[str]
    difficulty: float
    stability: float
    retrievability: float
    state: int
    due_date: datetime
    total_reviews: int
    correct_reviews: int
    created_at: datetime

    class Config:
        from_attributes = True


class FlashcardReviewCreate(BaseModel):
    rating: int  # 1=Again, 2=Hard, 3=Good, 4=Easy
    review_time_ms: int = 0


class FlashcardReviewResponse(BaseModel):
    flashcard: FlashcardResponse
    next_review: datetime
    interval_days: float
