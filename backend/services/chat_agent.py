from typing import List, Dict, Optional
from services.rag_service import rag_service


class ChatAgent:
    def __init__(self):
        self.system_prompt = """You are a PMP exam preparation tutor AI. You help students understand
Project Management Professional (PMP) concepts, PMBOK guide, and prepare for the PMP certification exam.

Your capabilities:
1. Explain PMP concepts clearly and concisely
2. Answer questions about PMBOK knowledge areas, process groups, and ITTOs
3. Help with PMP formulas (EVM, critical path, risk analysis)
4. Provide exam tips and strategies
5. Generate practice questions when asked
6. Explain why answers are correct or incorrect

Always be encouraging and educational. When answering, reference PMBOK concepts when relevant.
If you don't know something, say so rather than guessing."""

    async def chat(self, message: str, context_chunks: Optional[List[Dict]] = None, history: Optional[List[Dict]] = None) -> str:
        system = self.system_prompt
        if context_chunks:
            context = "\n\n".join([f"[Source: {c.get('filename', 'unknown')}]\n{c['content']}" for c in context_chunks])
            system += f"\n\nRelevant context from uploaded materials:\n{context}"

        messages = [{"role": "system", "content": system}]
        if history:
            messages.extend(history[-10:])
        messages.append({"role": "user", "content": message})

        prompt = f"{system}\n\nUser: {message}\nAssistant:"
        response = await rag_service.generate_from_prompt(prompt)
        return response

    async def explain_concept(self, concept: str, context_chunks: Optional[List[Dict]] = None) -> str:
        prompt = f"""Explain the PMP concept "{concept}" in detail.
Include:
1. Definition
2. Why it's important for PMP
3. How it relates to other PMBOK concepts
4. A real-world example
5. Common exam questions about it"""
        return await self.chat(prompt, context_chunks)

    async def evaluate_teach_back(self, topic: str, student_explanation: str) -> Dict:
        prompt = f"""Evaluate this student's explanation of "{topic}":

"{student_explanation}"

Respond in JSON format:
{{
    "understanding_score": 0-100,
    "strengths": ["what they got right"],
    "gaps": ["what they missed or got wrong"],
    "suggestions": ["how to improve"],
    "corrected_explanation": "a complete correct explanation"
}}"""
        response = await rag_service.generate_from_prompt(prompt)
        import json
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            return json.loads(response[json_start:json_end])
        except (json.JSONDecodeError, ValueError):
            return {
                "understanding_score": 50,
                "strengths": ["Attempted to explain"],
                "gaps": ["Could not fully evaluate"],
                "suggestions": ["Try rephrasing your explanation"],
                "corrected_explanation": response,
            }


chat_agent = ChatAgent()
