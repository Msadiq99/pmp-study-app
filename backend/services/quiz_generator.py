import json
import random
from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.document import DocumentChunk
from models.quiz import Quiz, QuizQuestion, QuizAnswer
from services.rag_service import rag_service


class QuizGenerator:
    QUESTION_TYPES = ["mcq", "true_false", "fill_blank", "matching"]

    async def generate_quiz(
        self,
        db: AsyncSession,
        user_id: int,
        knowledge_area: Optional[str] = None,
        num_questions: int = 10,
        question_types: List[str] = None,
        title: str = "Practice Quiz",
    ) -> Quiz:
        if question_types is None:
            question_types = ["mcq", "true_false"]

        query = select(DocumentChunk).join(DocumentChunk.document)
        if knowledge_area:
            query = query.where(Document.knowledge_area == knowledge_area)
        result = await db.execute(query.limit(20))
        chunks = result.scalars().all()

        if not chunks:
            raise ValueError("No content available for quiz generation. Upload some documents first.")

        quiz = Quiz(
            user_id=user_id,
            title=title,
            quiz_type="practice",
            knowledge_area=knowledge_area,
            total_questions=num_questions,
        )
        db.add(quiz)
        await db.flush()

        selected_chunks = random.sample(chunks, min(num_questions * 2, len(chunks)))
        context = "\n\n".join([c.content[:500] for c in selected_chunks])

        prompt = f"""Generate {num_questions} PMP exam practice questions based on this content.
Return ONLY a JSON array with this exact format:
[
  {{
    "question": "question text",
    "type": "mcq",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "A) option1",
    "explanation": "why this is correct",
    "difficulty": 0.5
  }},
  {{
    "question": "question text",
    "type": "true_false",
    "options": ["True", "False"],
    "correct": "True",
    "explanation": "explanation",
    "difficulty": 0.4
  }}
]

Types to include: {', '.join(question_types)}
Content:
{context[:3000]}

JSON:"""

        response = await rag_service.generate_from_prompt(prompt)
        try:
            json_match = response[response.find('['):response.rfind(']') + 1]
            questions_data = json.loads(json_match)
        except (json.JSONDecodeError, ValueError):
            questions_data = self._fallback_questions(num_questions, question_types)

        for i, q_data in enumerate(questions_data[:num_questions]):
            q_type = q_data.get("type", "mcq")
            if q_type not in question_types:
                q_type = question_types[0]

            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q_data.get("question", f"PMP Question {i+1}"),
                question_type=q_type,
                correct_answer=q_data.get("correct", ""),
                explanation=q_data.get("explanation", ""),
                difficulty=q_data.get("difficulty", 0.5),
                knowledge_area=knowledge_area,
                order_index=i,
            )
            db.add(question)
            await db.flush()

            for opt in q_data.get("options", []):
                answer = QuizAnswer(
                    question_id=question.id,
                    answer_text=opt,
                    is_correct=(opt == q_data.get("correct", "")),
                )
                db.add(answer)

        quiz.total_questions = len(questions_data[:num_questions])
        await db.commit()
        return quiz

    def _fallback_questions(self, num: int, types: List[str]) -> List[Dict]:
        templates = [
            {
                "question": "What is the primary purpose of the Project Charter?",
                "type": "mcq",
                "options": ["A) Authorize the project", "B) Define scope", "C) Assign team", "D) Set budget"],
                "correct": "A) Authorize the project",
                "explanation": "The Project Charter formally authorizes the project and gives the PM authority.",
                "difficulty": 0.3,
            },
            {
                "question": "In predictive project management, changes to scope are managed through a formal change control process.",
                "type": "true_false",
                "options": ["True", "False"],
                "correct": "True",
                "explanation": "Predictive (waterfall) projects use formal change control for scope changes.",
                "difficulty": 0.3,
            },
            {
                "question": "The formula for Cost Performance Index (CPI) is:",
                "type": "mcq",
                "options": ["A) EV / AC", "B) AC / EV", "C) PV / EV", "D) EV / PV"],
                "correct": "A) EV / AC",
                "explanation": "CPI = Earned Value / Actual Cost. CPI > 1 means under budget.",
                "difficulty": 0.5,
            },
        ]
        result = []
        for i in range(num):
            template = templates[i % len(templates)]
            q = template.copy()
            q["type"] = types[i % len(types)]
            result.append(q)
        return result


quiz_generator = QuizGenerator()
