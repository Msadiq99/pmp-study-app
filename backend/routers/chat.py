from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.document import DocumentChunk
from routers.auth import get_current_user
from schemas.study import ChatRequest
from services.chat_agent import chat_agent
from services.rag_service import rag_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(
    data: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    chunks = await rag_service.search_similar(db, data.message, user.id, top_k=3)
    response = await chat_agent.chat(data.message, context_chunks=chunks)
    return {
        "response": response,
        "sources": [
            {"filename": c["filename"], "page": c.get("page_number"), "heading": c.get("heading")}
            for c in chunks
        ],
    }


@router.post("/explain")
async def explain_concept(
    concept: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    chunks = await rag_service.search_similar(db, concept, user.id, top_k=3)
    response = await chat_agent.explain_concept(concept, context_chunks=chunks)
    return {"response": response, "concept": concept}
