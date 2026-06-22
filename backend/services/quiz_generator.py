import json
import random
from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.document import Document, DocumentChunk
from models.quiz import Quiz, QuizQuestion, QuizAnswer
from services.rag_service import rag_service
from services.adaptive_engine import adaptive_engine


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
        provider: str = None,
        model: str = None,
    ) -> Quiz:
        if question_types is None:
            question_types = ["mcq", "true_false"]

        # Retrieve user mastery state/weak areas to steer quiz content
        heatmap = await adaptive_engine.get_mastery_heatmap(db, user_id)
        weak_areas = adaptive_engine.identify_weak_areas(heatmap)

        query = select(DocumentChunk).join(DocumentChunk.document)
        if knowledge_area:
            query = query.where(Document.knowledge_area == knowledge_area)
        elif weak_areas:
            # Personalization: prioritize materials in user's weak areas
            query = query.where(Document.knowledge_area.in_(weak_areas))

        result = await db.execute(query.limit(30))
        chunks = result.scalars().all()

        # Fallback to any content if weak areas content is not available
        if not chunks and weak_areas:
            query = select(DocumentChunk).join(DocumentChunk.document)
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

        weak_areas_str = ", ".join(weak_areas) if weak_areas else "None"
        questions_data = []
        batch_size = 10
        total_needed = num_questions
        total_generated = 0

        # Loop in batches of 10 to prevent timeouts and context window issues
        while total_generated < total_needed:
            current_batch_size = min(batch_size, total_needed - total_generated)
            # Sample chunks for this specific batch
            selected_chunks = random.sample(chunks, min(current_batch_size * 2, len(chunks)))
            context = "\n\n".join([c.content[:500] for c in selected_chunks])

            prompt = f"""Generate {current_batch_size} PMP exam practice questions based on this content.
For MCQ (multiple choice) questions, you MUST follow a strict Chain-of-Thought (CoT) pattern in the explanation. The explanation field must contain:
1. Identifying the PMP Process Group & Knowledge Area.
2. Distractor Analysis: Evaluate every single incorrect option and explain exactly why it is wrong according to PMI standards.
3. Correct Answer reasoning: Explain why the correct option is the best/right option.

Return ONLY a JSON array with this exact format:
[
  {{
    "question": "question text",
    "type": "mcq",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "A) option1",
    "explanation": "Process Group / Knowledge Area:\\n- ...\\n\\nDistractor Analysis:\\n- Option B is incorrect because...\\n- Option C is incorrect because...\\n- Option D is incorrect because...\\n\\nCorrect Option Explanation:\\n- Option A is correct because...",
    "difficulty": 0.5
  }},
  {{
    "question": "question text",
    "type": "true_false",
    "options": ["True", "False"],
    "correct": "True",
    "explanation": "explanation text",
    "difficulty": 0.4
  }}
]

Types to include: {', '.join(question_types)}
User's Weak Areas to target (if matching content exists): {weak_areas_str}

Content:
{context[:3000]}

JSON:"""

            response = await rag_service.generate_from_prompt(prompt, provider=provider, model=model)
            try:
                json_start = response.find('[')
                json_end = response.rfind(']') + 1
                if json_start != -1 and json_end != -1:
                    json_match = response[json_start:json_end]
                    batch_questions = json.loads(json_match)
                    if isinstance(batch_questions, list):
                        questions_data.extend(batch_questions)
                        total_generated += len(batch_questions)
                        continue
                raise ValueError("Invalid JSON format")
            except (json.JSONDecodeError, ValueError):
                batch_questions = self._fallback_questions(current_batch_size, question_types)
                questions_data.extend(batch_questions)
                total_generated += current_batch_size

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
