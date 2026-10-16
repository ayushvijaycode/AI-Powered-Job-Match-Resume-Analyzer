from sqlalchemy import Column, DateTime, Float, Integer, String, Text, func
from .database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_filename = Column(String(255), nullable=False)
    job_title = Column(String(200), nullable=False, default="Untitled role")
    job_description = Column(Text, nullable=False)
    resume_text = Column(Text, nullable=False)
    match_score = Column(Float, nullable=False)
    skill_coverage = Column(Float, nullable=False)
    semantic_similarity = Column(Float, nullable=False)
    experience_relevance = Column(Float, nullable=False)
    matched_skills_json = Column(Text, nullable=False)
    missing_skills_json = Column(Text, nullable=False)
    resume_skills_json = Column(Text, nullable=False)
    job_skills_json = Column(Text, nullable=False)
    learning_plan_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
