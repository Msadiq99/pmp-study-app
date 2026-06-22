from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from database import get_db
from models.user import User
from models.quiz import Quiz, QuizQuestion, QuizAnswer
from routers.auth import get_current_user
from schemas.quiz import QuizCreate, QuizResponse, QuizQuestionResponse, QuizAnswerSubmit
from services.quiz_generator import quiz_generator

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    data: QuizCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        quiz = await quiz_generator.generate_quiz(
            db=db,
            user_id=user.id,
            knowledge_area=data.knowledge_area,
            num_questions=data.num_questions,
            question_types=data.question_types,
            title=data.title,
        )
        # Reload with relationships
        result = await db.execute(
            select(Quiz)
            .options(selectinload(Quiz.questions).selectinload(QuizQuestion.answers))
            .where(Quiz.id == quiz.id)
        )
        quiz = result.scalar_one()
        return QuizResponse.model_validate(quiz)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[QuizResponse])
async def list_quizzes(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions).selectinload(QuizQuestion.answers))
        .where(Quiz.user_id == user.id)
        .order_by(Quiz.created_at.desc())
    )
    return [QuizResponse.model_validate(q) for q in result.scalars().all()]


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions).selectinload(QuizQuestion.answers))
        .where(Quiz.id == quiz_id, Quiz.user_id == user.id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return QuizResponse.model_validate(quiz)


@router.post("/{quiz_id}/submit", response_model=QuizResponse)
async def submit_quiz_answer(
    quiz_id: int,
    data: QuizAnswerSubmit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Quiz).where(Quiz.id == quiz_id, Quiz.user_id == user.id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    q_result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.id == data.question_id, QuizQuestion.quiz_id == quiz_id)
    )
    question = q_result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Reset any previous selections for this question
    await db.execute(
        update(QuizAnswer)
        .where(QuizAnswer.question_id == question.id)
        .values(selected=False)
    )

    # Check if there is an existing option matching data.answer
    ans_result = await db.execute(
        select(QuizAnswer).where(
            QuizAnswer.question_id == question.id,
            func.lower(QuizAnswer.answer_text) == data.answer.strip().lower()
        )
    )
    matching_answer = ans_result.scalar_one_or_none()
    if matching_answer:
        matching_answer.selected = True
    else:
        # Create a new answer (for fill_blank or custom input)
        is_correct = data.answer.strip().lower() == question.correct_answer.strip().lower()
        answer = QuizAnswer(
            question_id=question.id,
            answer_text=data.answer,
            is_correct=is_correct,
            selected=True,
        )
        db.add(answer)

    # Calculate correct answers across the ENTIRE quiz
    correct_count = await db.scalar(
        select(func.count(QuizAnswer.id))
        .join(QuizQuestion, QuizAnswer.question_id == QuizQuestion.id)
        .where(
            QuizQuestion.quiz_id == quiz_id,
            QuizAnswer.selected == True,
            QuizAnswer.is_correct == True
        )
    ) or 0
    quiz.correct_answers = correct_count
    quiz.score = (quiz.correct_answers / max(1, quiz.total_questions)) * 100

    await db.commit()
    
    # Reload with relationships
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions).selectinload(QuizQuestion.answers))
        .where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one()
    return QuizResponse.model_validate(quiz)


@router.post("/{quiz_id}/complete")
async def complete_quiz(
    quiz_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Quiz).where(Quiz.id == quiz_id, Quiz.user_id == user.id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz.is_completed = True
    quiz.completed_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "completed", "score": quiz.score}
