import math
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from models.flashcard import Flashcard, FlashcardReview
from models.quiz import Quiz, QuizQuestion
from models.study_session import StudySession, StudyTopic
from models.knowledge_area import KnowledgeArea, TopicMastery
from models.user import User


class AdaptiveEngine:
    def __init__(self):
        self.INITIAL_EASE = 2.5
        self.MIN_EASE = 1.3
        self.GRADUATING_INTERVAL = 1
        self.EASY_INTERVAL = 4
        self.REQUEST_FORGOT = -1

    def fsrs_next_review(self, card: Flashcard, rating: int) -> Dict:
        state = card.state
        difficulty = card.difficulty
        stability = card.stability
        retrievability = card.retrievability

        if rating == 1:
            if state == 0:
                new_state = 1
                new_stability = 0.4
            elif state == 1:
                new_state = 1
                new_stability = stability * 0.5
            elif state == 2:
                new_state = 3
                new_stability = stability * 0.5
            else:
                new_state = 3
                new_stability = stability * 0.5
            new_difficulty = min(1.0, difficulty + 0.15)
        elif rating == 2:
            if state == 0:
                new_state = 1
                new_stability = 1.0
            elif state == 1:
                new_state = 2
                new_stability = stability * 1.2
            elif state == 2:
                new_stability = stability * 1.2
                new_state = 2
            else:
                new_state = 2
                new_stability = stability * 1.2
            new_difficulty = max(0.0, difficulty - 0.05)
        elif rating == 3:
            if state == 0:
                new_state = 2
                new_stability = self.GRADUATING_INTERVAL
            elif state == 1:
                new_state = 2
                new_stability = max(1.0, stability * 1.2)
            elif state == 2:
                new_stability = stability * difficulty * self.INITIAL_EASE
                new_state = 2
            else:
                new_state = 2
                new_stability = stability * 1.2
            new_difficulty = max(0.0, difficulty - 0.1)
        else:
            if state == 0:
                new_state = 2
                new_stability = self.EASY_INTERVAL
            elif state == 1:
                new_state = 2
                new_stability = max(4.0, stability * 1.3)
            elif state == 2:
                new_stability = stability * difficulty * self.INITIAL_EASE * 1.3
                new_state = 2
            else:
                new_state = 2
                new_stability = stability * 1.3
            new_difficulty = max(0.0, difficulty - 0.2)

        new_stability = max(0.1, new_stability)
        interval_days = max(1, int(new_stability))
        next_review = datetime.now(timezone.utc) + timedelta(days=interval_days)
        new_retrievability = math.exp(-0.5 * (1 / new_stability))

        return {
            "state": new_state,
            "difficulty": round(min(1.0, max(0.0, new_difficulty)), 4),
            "stability": round(new_stability, 4),
            "retrievability": round(new_retrievability, 4),
            "due_date": next_review,
            "interval_days": interval_days,
        }

    async def get_due_cards(self, db: AsyncSession, user_id: int, limit: int = 20) -> List[Flashcard]:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(Flashcard).where(
                and_(
                    Flashcard.user_id == user_id,
                    Flashcard.is_active == True,
                    Flashcard.due_date <= now,
                )
            ).order_by(Flashcard.due_date.asc()).limit(limit)
        )
        return result.scalars().all()

    async def calculate_readiness(self, db: AsyncSession, user_id: int) -> float:
        total_areas = 12
        result = await db.execute(
            select(TopicMastery).where(TopicMastery.user_id == user_id)
        )
        masteries = result.scalars().all()
        if not masteries:
            return 0.0
        mastery_score = sum(m.mastery_level for m in masteries) / (total_areas * 100)
        quiz_result = await db.execute(
            select(Quiz).where(and_(Quiz.user_id == user_id, Quiz.is_completed == True))
        )
        quizzes = quiz_result.scalars().all()
        if quizzes:
            avg_score = sum(q.score for q in quizzes) / len(quizzes) / 100
        else:
            avg_score = 0.0
        readiness = (mastery_score * 0.4) + (avg_score * 0.3) + (avg_score * 0.3)
        return min(1.0, round(readiness, 4))

    async def get_mastery_heatmap(self, db: AsyncSession, user_id: int) -> List[Dict]:
        result = await db.execute(
            select(TopicMastery, KnowledgeArea)
            .join(KnowledgeArea, TopicMastery.knowledge_area_id == KnowledgeArea.id)
            .where(TopicMastery.user_id == user_id)
        )
        rows = result.fetchall()
        return [
            {
                "area": ka.name,
                "domain": ka.domain,
                "mastery": tm.mastery_level,
                "questions_attempted": tm.questions_attempted,
                "questions_correct": tm.questions_correct,
                "last_studied": tm.last_studied.isoformat() if tm.last_studied else None,
            }
            for tm, ka in rows
        ]

    def identify_weak_areas(self, heatmap: List[Dict]) -> List[str]:
        return [h["area"] for h in heatmap if h["mastery"] < 50]

    def zpd_calibrate(self, results: List[Dict]) -> Tuple[float, float]:
        if not results:
            return (0.3, 0.7)
        accuracies_by_difficulty = {}
        for r in results:
            d = r.get("difficulty", 0.5)
            bucket = round(d, 1)
            if bucket not in accuracies_by_difficulty:
                accuracies_by_difficulty[bucket] = {"correct": 0, "total": 0}
            accuracies_by_difficulty[bucket]["total"] += 1
            if r.get("correct", False):
                accuracies_by_difficulty[bucket]["correct"] += 1
        zpd_low = 0.3
        zpd_high = 0.7
        for bucket, stats in sorted(accuracies_by_difficulty.items()):
            acc = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            if 0.6 <= acc <= 0.8:
                zpd_low = max(0.0, bucket - 0.1)
                zpd_high = min(1.0, bucket + 0.1)
                break
        return (zpd_low, zpd_high)


adaptive_engine = AdaptiveEngine()
