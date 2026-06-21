from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class KnowledgeArea(Base):
    __tablename__ = "knowledge_areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    domain = Column(String(100), nullable=True)  # people, process, business_environment
    process_group = Column(String(100), nullable=True)
    icon = Column(String(50), nullable=True)
    color = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    masteries = relationship("TopicMastery", back_populates="knowledge_area")


class TopicMastery(Base):
    __tablename__ = "topic_masteries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    knowledge_area_id = Column(Integer, ForeignKey("knowledge_areas.id"), nullable=False)
    mastery_level = Column(Float, default=0.0)
    questions_attempted = Column(Integer, default=0)
    questions_correct = Column(Integer, default=0)
    flashcards_mastered = Column(Integer, default=0)
    last_studied = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="topic_masteries")
    knowledge_area = relationship("KnowledgeArea", back_populates="masteries")
