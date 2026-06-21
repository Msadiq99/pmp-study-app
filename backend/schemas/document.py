from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    total_pages: int
    is_processed: bool
    processing_status: str
    knowledge_area: Optional[str] = None
    created_at: datetime
    chunk_count: int = 0

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    message: str
