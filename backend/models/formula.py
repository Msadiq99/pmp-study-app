from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.sql import func
from database import Base


class Formula(Base):
    __tablename__ = "formulas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    formula = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # evm, schedule, risk, quality, procurement
    variables = Column(Text, nullable=True)  # JSON: {"PV": "Planned Value", ...}
    example = Column(Text, nullable=True)
    tips = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
