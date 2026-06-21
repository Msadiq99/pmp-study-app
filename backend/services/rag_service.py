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
        self.ollama_url = f"{settings.OLLAMA_BASE_URL}/api/generate"

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
                embedding=json.dumps(embedding),
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

    async def generate_answer(self, query: str, context_chunks: List[Dict], model: str = "llama3.2") -> str:
        context = "\n\n---\n\n".join([
            f"Source: {c['filename']}, Page {c.get('page_number', 'N/A')}\n{c['content']}"
            for c in context_chunks
        ])
        prompt = f"""You are a PMP exam preparation tutor. Answer the question based ONLY on the provided context.
If the context doesn't contain enough information, say so.

Context:
{context}

Question: {query}

Answer:"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.ollama_url,
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                    }
                )
                response.raise_for_status()
                return response.json().get("response", "I couldn't generate an answer.")
        except Exception as e:
            return f"I'm having trouble connecting to the AI model. Please ensure Ollama is running. Error: {str(e)}"

    async def generate_from_prompt(self, prompt: str, model: str = "llama3.2") -> str:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.ollama_url,
                    json={"model": model, "prompt": prompt, "stream": False}
                )
                response.raise_for_status()
                return response.json().get("response", "")
        except Exception as e:
            return f"Error: {str(e)}"


rag_service = RAGService()
