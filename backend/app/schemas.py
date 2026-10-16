from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AnalysisSummary(BaseModel):
    id: int
    resume_filename: str
    job_title: str
    match_score: float
    skill_coverage: float
    semantic_similarity: float
    experience_relevance: float
    matched_skills: list[str]
    missing_skills: list[str]
    resume_skills: list[str]
    job_skills: list[str]
    learning_plan: list[dict[str, str]]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AnalysisDetail(AnalysisSummary):
    job_description: str
    resume_text: str
