import json
import httpx
from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from models.document import DocumentChunk, Document
from services.embedding_service import embedding_service
from config import settings


class RAGService:
    def __init__(self):
        pass

    async def index_document_chunks(self, db: AsyncSession, document_id: int, chunks: List[Dict]):
        texts = [c["content"] for c in chunks]
        embeddings = embedding_service.embed_batch(texts)
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            db_chunk = DocumentChunk(
                document_id=document_id,
                content=chunk["content"],
                chunk_index=i,
                page_number=chunk.get("page_number"),
                heading=chunk.get("heading"),
                embedding=embedding,
            )
            db.add(db_chunk)
        await db.commit()

    async def search_similar(self, db: AsyncSession, query: str, user_id: int, top_k: int = 5) -> List[Dict]:
        query_embedding = embedding_service.embed_text(query)
        result = await db.execute(
            text("""
                SELECT dc.id, dc.content, dc.heading, dc.page_number, dc.document_id,
                       d.original_filename, d.knowledge_area,
                       1 - (dc.embedding::vector <=> :query_embedding::vector) as similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.user_id = :user_id
                ORDER BY dc.embedding::vector <=> :query_embedding::vector
                LIMIT :top_k
            """),
            {"query_embedding": str(query_embedding), "user_id": user_id, "top_k": top_k}
        )
        rows = result.fetchall()
        return [
            {
                "id": row[0],
                "content": row[1],
                "heading": row[2],
                "page_number": row[3],
                "document_id": row[4],
                "filename": row[5],
                "knowledge_area": row[6],
                "similarity": float(row[7]),
            }
            for row in rows
        ]

    async def _call_ollama(self, prompt: str, model: str = None) -> str:
        model = model or settings.OLLAMA_MODEL
        url = f"{settings.ollama_url}/api/generate"
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json={"model": model, "prompt": prompt, "stream": False})
            response.raise_for_status()
            return response.json().get("response", "")

    async def _call_claude(self, prompt: str, model: str = None) -> str:
        model = model or settings.CLAUDE_MODEL
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": settings.CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": model,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"] if data.get("content") else ""

    async def _call_llm(self, prompt: str, model: str = None) -> str:
        provider = settings.LLM_PROVIDER
        if provider == "claude":
            return await self._call_claude(prompt, model)
        else:
            return await self._call_ollama(prompt, model)

    async def generate_answer(self, query: str, context_chunks: List[Dict], model: str = None) -> str:
        context = "\n\n---\n\n".join([
            f"Source: {c['filename']}, Page {c.get('page_number', 'N/A')}\n{c['content']}"
            for c in context_chunks
        ])
        prompt = f"""You are a PMP exam preparation tutor. Answer the question based on the provided context, adhering strictly to PMI standards and PMBOK Guide 7th Edition concepts.

Guidelines:
1. Base your answer only on the provided context and verified PMP rules.
2. If the context doesn't contain enough information, state that clearly but try to explain the relevant general PMP principle.
3. Formulate the response with clear headings, bullet points, and reference the source files/pages provided in the context when applicable.

Context:
{context}

Question: {query}

Answer:"""
        try:
            return await self._call_llm(prompt, model)
        except Exception as e:
            provider = settings.LLM_PROVIDER
            if provider == "claude":
                hint = "Check CLAUDE_API_KEY in your .env file."
            elif provider == "ollama_cloud":
                hint = "Check OLLAMA_CLOUD_URL and OLLAMA_CLOUD_KEY in your .env file."
            else:
                hint = "Ensure Ollama is running: ollama serve"
            return f"AI service error ({provider}): {str(e)}. {hint}"

    async def generate_from_prompt(self, prompt: str, model: str = None) -> str:
        try:
            return await self._call_llm(prompt, model)
        except Exception as e:
            return f"AI service error: {str(e)}"


rag_service = RAGService()
