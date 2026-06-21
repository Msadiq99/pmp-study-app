from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
from database import get_db
from models.user import User
from models.flashcard import Flashcard, FlashcardReview
from routers.auth import get_current_user
from schemas.flashcard import FlashcardCreate, FlashcardResponse, FlashcardReviewCreate, FlashcardReviewResponse
from services.adaptive_engine import adaptive_engine

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])


@router.post("/", response_model=FlashcardResponse)
async def create_flashcard(
    data: FlashcardCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = Flashcard(
        user_id=user.id,
        front=data.front,
        back=data.back,
        knowledge_area=data.knowledge_area,
        document_id=data.document_id,
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return FlashcardResponse.model_validate(card)


@router.get("/", response_model=list[FlashcardResponse])
async def list_flashcards(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Flashcard).where(Flashcard.user_id == user.id, Flashcard.is_active == True)
    )
    return [FlashcardResponse.model_validate(c) for c in result.scalars().all()]


@router.get("/due", response_model=list[FlashcardResponse])
async def get_due_flashcards(
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cards = await adaptive_engine.get_due_cards(db, user.id, limit)
    return [FlashcardResponse.model_validate(c) for c in cards]


@router.post("/{flashcard_id}/review", response_model=FlashcardReviewResponse)
async def review_flashcard(
    flashcard_id: int,
    data: FlashcardReviewCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == flashcard_id, Flashcard.user_id == user.id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    review = FlashcardReview(
        flashcard_id=card.id,
        rating=data.rating,
        review_time_ms=data.review_time_ms,
    )
    db.add(review)

    next_review = adaptive_engine.fsrs_next_review(card, data.rating)
    card.state = next_review["state"]
    card.difficulty = next_review["difficulty"]
    card.stability = next_review["stability"]
    card.retrievability = next_review["retrievability"]
    card.due_date = next_review["due_date"]
    card.total_reviews += 1
    if data.rating >= 3:
        card.correct_reviews += 1

    await db.commit()
    await db.refresh(card)

    return FlashcardReviewResponse(
        flashcard=FlashcardResponse.model_validate(card),
        next_review=next_review["due_date"],
        interval_days=next_review["interval_days"],
    )


@router.delete("/{flashcard_id}")
async def delete_flashcard(
    flashcard_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == flashcard_id, Flashcard.user_id == user.id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    card.is_active = False
    await db.commit()
    return {"status": "deleted"}
