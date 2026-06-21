from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.quiz import Quiz, QuizQuestion
from routers.auth import get_current_user
from services.quiz_generator import quiz_generator
import random

router = APIRouter(prefix="/api/exam", tags=["exam"])

EXAM_DOMAINS = {
    "people": {"weight": 0.42, "name": "People"},
    "process": {"weight": 0.50, "name": "Process"},
    "business_environment": {"weight": 0.08, "name": "Business Environment"},
}


@router.post("/simulate")
async def start_exam_simulation(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    quiz = await quiz_generator.generate_quiz(
        db=db,
        user_id=user.id,
        num_questions=180,
        question_types=["mcq", "true_false", "fill_blank", "matching"],
        title="PMP Exam Simulation",
    )
    return {
        "quiz_id": quiz.id,
        "total_questions": 180,
        "time_limit_minutes": 230,
        "domains": EXAM_DOMAINS,
        "instructions": [
            "You have 230 minutes to complete 180 questions",
            "There will be two 10-minute breaks",
            "Questions are a mix of predictive, agile, and hybrid approaches",
            "Answers are based on PMBOK 7th Edition and ECO",
        ],
    }


@router.get("/{quiz_id}/status")
async def exam_status(
    quiz_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Quiz).where(Quiz.id == quiz_id, Quiz.user_id == user.id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Exam not found")

    answered = await db.scalar(
        select(QuizQuestion.id).where(QuizQuestion.quiz_id == quiz_id)
    )
    return {
        "quiz_id": quiz.id,
        "total_questions": quiz.total_questions,
        "score": quiz.score,
        "is_completed": quiz.is_completed,
        "time_limit_minutes": quiz.time_limit_minutes,
    }
