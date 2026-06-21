import os
import json
import re
from typing import List, Dict, Tuple
import fitz  # PyMuPDF
from config import settings


class DocumentProcessor:
    def __init__(self):
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP

    async def extract_text(self, file_path: str) -> Dict:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return await self._extract_pdf(file_path)
        elif ext in [".txt", ".md"]:
            return await self._extract_text(file_path)
        elif ext in [".docx", ".doc"]:
            return await self._extract_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    async def _extract_pdf(self, file_path: str) -> Dict:
        doc = fitz.open(file_path)
        pages = []
        full_text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            pages.append({
                "page_number": page_num + 1,
                "text": text,
                "char_count": len(text),
            })
            full_text += f"\n\n--- Page {page_num + 1} ---\n\n{text}"
        doc.close()
        return {
            "text": full_text,
            "pages": pages,
            "total_pages": len(pages),
            "total_chars": len(full_text),
        }

    async def _extract_text(self, file_path: str) -> Dict:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        return {
            "text": text,
            "pages": [{"page_number": 1, "text": text, "char_count": len(text)}],
            "total_pages": 1,
            "total_chars": len(text),
        }

    async def _extract_docx(self, file_path: str) -> Dict:
        try:
            import docx
            doc = docx.Document(file_path)
            text = "\n\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            return {
                "text": text,
                "pages": [{"page_number": 1, "text": text, "char_count": len(text)}],
                "total_pages": 1,
                "total_chars": len(text),
            }
        except ImportError:
            raise ImportError("python-docx is required for DOCX support. Install with: pip install python-docx")

    def chunk_text(self, text: str, heading: str = None) -> List[Dict]:
        chunks = []
        sections = self._split_by_headings(text)
        for section in sections:
            section_text = section["text"].strip()
            if not section_text:
                continue
            if len(section_text) <= self.chunk_size:
                chunks.append({
                    "content": section_text,
                    "heading": section.get("heading", heading),
                    "page_number": section.get("page_number"),
                })
            else:
                sub_chunks = self._split_long_text(section_text)
                for i, sub_chunk in enumerate(sub_chunks):
                    chunks.append({
                        "content": sub_chunk,
                        "heading": section.get("heading", heading),
                        "page_number": section.get("page_number"),
                    })
        return chunks

    def _split_by_headings(self, text: str) -> List[Dict]:
        heading_pattern = r'\n(#{1,6}\s+.+|[A-Z][A-Z\s]{5,}\n)'
        parts = re.split(heading_pattern, text)
        sections = []
        current_heading = None
        for part in parts:
            part = part.strip()
            if not part:
                continue
            if re.match(r'^#{1,6}\s+|^[A-Z][A-Z\s]{5,}$', part):
                current_heading = part.lstrip('#').strip()
            else:
                sections.append({
                    "text": part,
                    "heading": current_heading,
                    "page_number": None,
                })
        if not sections:
            sections = [{"text": text, "heading": None, "page_number": None}]
        return sections

    def _split_long_text(self, text: str) -> List[str]:
        chunks = []
        sentences = re.split(r'(?<=[.!?])\s+', text)
        current_chunk = ""
        for sentence in sentences:
            if len(current_chunk) + len(sentence) + 1 <= self.chunk_size:
                current_chunk += (" " if current_chunk else "") + sentence
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = sentence
        if current_chunk:
            chunks.append(current_chunk)
        if not chunks:
            chunks = [text[i:i + self.chunk_size] for i in range(0, len(text), self.chunk_size)]
        return chunks


document_processor = DocumentProcessor()
