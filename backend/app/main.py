import json
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import CORS_ORIGINS, MAX_UPLOAD_MB
from .database import Base, engine, get_db
from .matcher import analyze_resume
from .models import Analysis
from .parser import ResumeParseError, extract_pdf_text
from .schemas import AnalysisDetail, AnalysisSummary

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Job Match & Resume Analyzer",
    version="1.0.0",
    description="Explainable resume-to-job matching prototype. Scores are heuristics, not hiring probabilities.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

def _to_summary(row: Analysis) -> dict:
    return {
        "id": row.id,
        "resume_filename": row.resume_filename,
        "job_title": row.job_title,
        "match_score": row.match_score,
        "skill_coverage": row.skill_coverage,
        "semantic_similarity": row.semantic_similarity,
        "experience_relevance": row.experience_relevance,
        "matched_skills": json.loads(row.matched_skills_json),
        "missing_skills": json.loads(row.missing_skills_json),
        "resume_skills": json.loads(row.resume_skills_json),
        "job_skills": json.loads(row.job_skills_json),
        "learning_plan": json.loads(row.learning_plan_json),
        "created_at": row.created_at or datetime.now(timezone.utc),
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "job-match-resume-analyzer"}

@app.post("/api/analyze", response_model=AnalysisDetail)
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    job_title: str = Form("Untitled role"),
    db: Session = Depends(get_db),
):
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF resume.")
    content = await resume.read()
    if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"PDF exceeds the {MAX_UPLOAD_MB} MB upload limit.")
    if len(job_description.strip()) < 40:
        raise HTTPException(status_code=400, detail="Please paste a job description with at least 40 characters.")
    try:
        resume_text = extract_pdf_text(content)
    except ResumeParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    result = analyze_resume(resume_text, job_description.strip())
    row = Analysis(
        resume_filename=resume.filename[:255],
        job_title=(job_title.strip() or "Untitled role")[:200],
        job_description=job_description.strip(),
        resume_text=resume_text,
        match_score=result["match_score"],
        skill_coverage=result["skill_coverage"],
        semantic_similarity=result["semantic_similarity"],
        experience_relevance=result["experience_relevance"],
        matched_skills_json=json.dumps(result["matched_skills"]),
        missing_skills_json=json.dumps(result["missing_skills"]),
        resume_skills_json=json.dumps(result["resume_skills"]),
        job_skills_json=json.dumps(result["job_skills"]),
        learning_plan_json=json.dumps(result["learning_plan"]),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    payload = _to_summary(row)
    payload["job_description"] = row.job_description
    payload["resume_text"] = row.resume_text
    return payload

@app.get("/api/analyses", response_model=list[AnalysisSummary])
def list_analyses(db: Session = Depends(get_db)):
    rows = db.query(Analysis).order_by(Analysis.created_at.desc(), Analysis.id.desc()).limit(100).all()
    return [_to_summary(row) for row in rows]

@app.get("/api/analyses/{analysis_id}", response_model=AnalysisDetail)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    row = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    payload = _to_summary(row)
    payload["job_description"] = row.job_description
    payload["resume_text"] = row.resume_text
    return payload

@app.delete("/api/analyses/{analysis_id}")
def delete_analysis(analysis_id: int, db: Session = Depends(get_db)):
    row = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    db.delete(row)
    db.commit()
    return {"deleted": True, "id": analysis_id}
