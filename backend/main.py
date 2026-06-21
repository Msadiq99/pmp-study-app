from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import init_db
from config import settings

app = FastAPI(title="PMP Study App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, documents, flashcards, quiz, study, analytics, chat, formulas, groups, exam

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(flashcards.router)
app.include_router(quiz.router)
app.include_router(study.router)
app.include_router(analytics.router)
app.include_router(chat.router)
app.include_router(formulas.router)
app.include_router(groups.router)
app.include_router(exam.router)


@app.on_event("startup")
async def startup():
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@app.get("/")
async def root():
    return {"message": "PMP Study App API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
