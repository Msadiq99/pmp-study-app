from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuizCreate(BaseModel):
    title: str
    quiz_type: str = "practice"
    knowledge_area: Optional[str] = None
    num_questions: int = 10
    question_types: List[str] = ["mcq", "true_false", "fill_blank"]
    time_limit_minutes: Optional[int] = None


class QuizQuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    options: List[str] = []
    knowledge_area: Optional[str]
    difficulty: float

    class Config:
        from_attributes = True


class QuizResponse(BaseModel):
    id: int
    title: str
    quiz_type: str
    knowledge_area: Optional[str]
    total_questions: int
    correct_answers: int
    score: float
    is_completed: bool
    time_limit_minutes: Optional[int]
    created_at: datetime
    questions: List[QuizQuestionResponse] = []

    class Config:
        from_attributes = True


class QuizAnswerSubmit(BaseModel):
    question_id: int
    answer: str
