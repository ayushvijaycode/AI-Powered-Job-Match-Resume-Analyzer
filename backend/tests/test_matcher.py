from app.matcher import analyze_resume, extract_skills

def test_extract_skills_handles_common_skills():
    skills = extract_skills("Python, SQL, FastAPI, PostgreSQL and React")
    assert "Python" in skills
    assert "SQL" in skills
    assert "FastAPI" in skills
    assert "PostgreSQL" in skills
    assert "React" in skills

def test_matcher_reports_missing_skills_and_bounded_scores():
    result = analyze_resume(
        "Python developer. Built a FastAPI project with SQL and Git.",
        "Junior developer role requiring Python, SQL, Docker, Git, and pytest. Build REST API services."
    )
    assert "Python" in result["matched_skills"]
    assert "Docker" in result["missing_skills"]
    for key in ("match_score", "skill_coverage", "semantic_similarity", "experience_relevance"):
        assert 0 <= result[key] <= 100
    assert result["learning_plan"]
