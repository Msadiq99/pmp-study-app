from typing import List, Dict, Optional
from services.rag_service import rag_service


class VoiceService:
    async def transcribe_audio(self, audio_data: bytes, language: str = "en") -> str:
        return "[Voice transcription requires Web Speech API on the frontend]"

    async def evaluate_teach_back(self, topic: str, transcript: str, provider: str = None, model: str = None) -> Dict:
        return await chat_agent.evaluate_teach_back(topic, transcript, provider=provider, model=model)

    async def generate_study_summary(self, transcripts: List[str], topic: str, provider: str = None, model: str = None) -> str:
        combined = "\n".join(transcripts)
        prompt = f"""Based on these student explanations about "{topic}":

{combined}

Provide a concise study summary that:
1. Highlights what the student understands well
2. Identifies key concepts they should review
3. Gives 3-5 actionable study recommendations"""
        return await rag_service.generate_from_prompt(prompt, provider=provider, model=model)


from services.chat_agent import chat_agent
voice_service = VoiceService()
