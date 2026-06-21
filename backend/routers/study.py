from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from database import get_db
from models.user import User
from models.study_session import StudySession
from routers.auth import get_current_user
from schemas.study import StudySessionResponse, ChatRequest, VoiceTranscript
from services.chat_agent import chat_agent
from services.voice_service import voice_service
from services.rag_service import rag_service
from services.adaptive_engine import adaptive_engine

router = APIRouter(prefix="/api/study", tags=["study"])


@router.post("/session", response_model=StudySessionResponse)
async def start_study_session(
    session_type: str = "study",
    knowledge_area: str = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = StudySession(
        user_id=user.id,
        session_type=session_type,
        knowledge_area=knowledge_area,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return StudySessionResponse.model_validate(session)


@router.put("/session/{session_id}/end", response_model=StudySessionResponse)
async def end_study_session(
    session_id: int,
    questions_attempted: int = 0,
    questions_correct: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudySession).where(StudySession.id == session_id, StudySession.user_id == user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.ended_at = datetime.utcnow()
    duration = (session.ended_at - session.started_at).total_seconds() / 60
    session.duration_minutes = int(duration)
    session.questions_attempted = questions_attempted
    session.questions_correct = questions_correct
    await db.commit()
    return StudySessionResponse.model_validate(session)


@router.get("/plan")
async def get_study_plan(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    heatmap = await adaptive_engine.get_mastery_heatmap(db, user.id)
    weak_areas = adaptive_engine.identify_weak_areas(heatmap)
    readiness = await adaptive_engine.calculate_readiness(db, user.id)
    return {
        "weak_areas": weak_areas,
        "readiness_score": round(readiness * 100, 1),
        "recommended_topics": weak_areas[:5] if weak_areas else ["Review all PMBOK knowledge areas"],
        "estimated_hours": max(1, (len(weak_areas) or 1) * 2),
    }


@router.post("/voice/evaluate")
async def evaluate_voice_teach_back(
    data: VoiceTranscript,
    user: User = Depends(get_current_user),
):
    if not data.topic:
        raise HTTPException(status_code=400, detail="Topic is required")
    evaluation = await voice_service.evaluate_teach_back(data.topic, data.text)
    return evaluation
