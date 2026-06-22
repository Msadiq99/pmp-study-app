from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from models.quiz import Quiz, QuizQuestion
from models.flashcard import Flashcard, FlashcardReview
from models.study_session import StudySession
from models.document import Document
from services.adaptive_engine import adaptive_engine


class AnalyticsService:
    async def get_dashboard(self, db: AsyncSession, user_id: int) -> Dict:
        readiness = await adaptive_engine.calculate_readiness(db, user_id)
        heatmap = await adaptive_engine.get_mastery_heatmap(db, user_id)
        weak_areas = adaptive_engine.identify_weak_areas(heatmap)

        doc_count = await db.scalar(
            select(func.count(Document.id)).where(Document.user_id == user_id)
        )
        flashcard_count = await db.scalar(
            select(func.count(Flashcard.id)).where(Flashcard.user_id == user_id)
        )
        quiz_count = await db.scalar(
            select(func.count(Quiz.id)).where(Quiz.user_id == user_id)
        )
        session_count = await db.scalar(
            select(func.count(StudySession.id)).where(StudySession.user_id == user_id)
        )

        recent_quizzes = await db.execute(
            select(Quiz).where(Quiz.user_id == user_id).order_by(Quiz.created_at.desc()).limit(5)
        )
        recent = recent_quizzes.scalars().all()

        streak = await self._calculate_streak(db, user_id)

        return {
            "readiness_score": round(readiness * 100, 1),
            "documents_uploaded": doc_count or 0,
            "flashcards_total": flashcard_count or 0,
            "quizzes_taken": quiz_count or 0,
            "study_sessions": session_count or 0,
            "mastery_heatmap": heatmap,
            "weak_areas": weak_areas,
            "recent_quizzes": [
                {"id": q.id, "title": q.title, "score": q.score, "date": q.created_at.isoformat()}
                for q in recent
            ],
            "study_streak": streak,
        }

    async def _calculate_streak(self, db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            select(StudySession.started_at)
            .where(StudySession.user_id == user_id)
            .order_by(StudySession.started_at.desc())
            .limit(30)
        )
        dates = [r[0].date() for r in result.fetchall()]
        if not dates:
            return 0
        unique_dates = sorted(set(dates), reverse=True)
        streak = 0
        from datetime import date, timedelta
        today = date.today()
        
        if unique_dates[0] < today - timedelta(days=1):
            return 0
            
        start_date = today if unique_dates[0] == today else (today - timedelta(days=1))
        
        for d in unique_dates:
            if d == start_date - timedelta(days=streak):
                streak += 1
            else:
                break
        return streak

    async def get_study_velocity(self, db: AsyncSession, user_id: int) -> Dict:
        result = await db.execute(
            select(StudySession)
            .where(StudySession.user_id == user_id)
            .order_by(StudySession.started_at.desc())
            .limit(30)
        )
        sessions = result.scalars().all()
        if not sessions:
            return {"avg_questions_per_day": 0, "avg_minutes_per_day": 0, "total_study_hours": 0}
        total_questions = sum(s.questions_attempted for s in sessions)
        total_minutes = sum(s.duration_minutes for s in sessions)
        days = max(1, len(set(s.started_at.date() for s in sessions)))
        return {
            "avg_questions_per_day": round(total_questions / days, 1),
            "avg_minutes_per_day": round(total_minutes / days, 1),
            "total_study_hours": round(total_minutes / 60, 1),
        }


analytics_service = AnalyticsService()
