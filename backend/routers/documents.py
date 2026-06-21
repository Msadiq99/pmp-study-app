import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.document import Document, DocumentChunk
from routers.auth import get_current_user
from schemas.document import DocumentResponse, DocumentUploadResponse
from services.document_processor import document_processor
from services.embedding_service import embedding_service
from services.rag_service import rag_service
from config import settings

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/markdown": "md",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
}


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    knowledge_area: str = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = ALLOWED_TYPES[file.content_type]
    filename = f"{user.id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        user_id=user.id,
        filename=filename,
        original_filename=file.filename,
        file_type=ext,
        file_size=len(content),
        knowledge_area=knowledge_area,
        processing_status="processing",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    try:
        extraction = await document_processor.extract_text(file_path)
        chunks = document_processor.chunk_text(extraction["text"])
        doc.total_pages = extraction["total_pages"]
        doc.is_processed = True
        doc.processing_status = "completed"

        await rag_service.index_document_chunks(db, doc.id, chunks)
        await db.commit()
    except Exception as e:
        doc.processing_status = f"error: {str(e)}"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

    return DocumentUploadResponse(
        id=doc.id,
        filename=doc.original_filename,
        status="completed",
        message=f"Processed {len(chunks)} chunks from {extraction['total_pages']} pages",
    )


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.user_id == user.id).order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    responses = []
    for doc in docs:
        chunk_count = await db.scalar(
            select(DocumentChunk.id).where(DocumentChunk.document_id == doc.id)
        )
        resp = DocumentResponse.model_validate(doc)
        resp.chunk_count = await db.scalar(
            select(DocumentChunk.id).where(DocumentChunk.document_id == doc.id).limit(1)
        ) or 0
        responses.append(resp)
    return responses


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    file_path = os.path.join(settings.UPLOAD_DIR, doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    await db.delete(doc)
    await db.commit()
    return {"status": "deleted"}
