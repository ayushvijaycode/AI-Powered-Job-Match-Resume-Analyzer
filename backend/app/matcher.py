import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SKILL_DICTIONARY = [
    "Python", "Java", "C++", "C", "JavaScript", "TypeScript", "SQL", "PostgreSQL",
    "MySQL", "SQLite", "MongoDB", "Pandas", "NumPy", "Matplotlib", "Seaborn",
    "scikit-learn", "Machine Learning", "Deep Learning", "Natural Language Processing",
    "NLP", "TensorFlow", "PyTorch", "Power BI", "Tableau", "Excel", "Data Analysis",
    "Data Visualization", "Statistics", "A/B Testing", "ETL", "Data Engineering",
    "FastAPI", "Flask", "Django", "REST API", "API", "React", "HTML", "CSS",
    "Node.js", "Express", "Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure",
    "Linux", "CI/CD", "pytest", "Unit Testing", "Data Structures", "Algorithms",
    "Problem Solving", "OOP", "Object-Oriented Programming", "Agile", "Communication",
    "Leadership", "Project Management", "Pandas", "Spark", "Airflow", "Redis",
    "System Design", "Computer Networks", "Operating Systems", "DBMS"
]

ALIASES = {
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "natural language processing": "Natural Language Processing",
    "nlp": "NLP",
    "restful api": "REST API",
    "rest apis": "REST API",
    "data structures and algorithms": "Data Structures",
    "dsa": "Data Structures",
    "powerbi": "Power BI",
    "js": "JavaScript",
    "ts": "TypeScript",
}

LEARNING_RESOURCES = {
    "Python": "Practice functions, collections, modules, exceptions, and file handling.",
    "SQL": "Learn SELECT, JOINs, GROUP BY, subqueries, and window functions; solve practice queries.",
    "PostgreSQL": "Practice schema design, indexes, constraints, joins, and query plans.",
    "FastAPI": "Build CRUD endpoints, request validation, dependency injection, and API docs.",
    "REST API": "Study HTTP methods, status codes, JSON, pagination, and error handling.",
    "Git": "Practice branching, commits, merges, pull requests, and resolving conflicts.",
    "Docker": "Containerize one app, define services with Compose, and use environment variables.",
    "pytest": "Write unit tests, fixtures, parametrized tests, and API tests.",
    "React": "Build reusable components, forms, state handling, and API integration.",
    "Machine Learning": "Review train/test splits, baselines, evaluation metrics, and data leakage.",
    "Pandas": "Practice joins, groupby, missing data, datetime handling, and vectorized operations.",
    "Data Structures": "Practice arrays, hash maps, stacks, queues, trees, graphs, and complexity.",
    "Algorithms": "Practice binary search, sorting, recursion, greedy methods, and graph traversal.",
}

def _normalise(text: str) -> str:
    text = text.lower().replace("nodejs", "node.js").replace("powerbi", "power bi")
    text = re.sub(r"\s+", " ", text)
    return text

def extract_skills(text: str) -> list[str]:
    normalized = _normalise(text)
    found = []
    for skill in SKILL_DICTIONARY:
        pattern = r"(?<![a-z0-9+#.])" + re.escape(skill.lower()) + r"(?![a-z0-9+#.])"
        if re.search(pattern, normalized):
            canonical = ALIASES.get(skill.lower(), skill)
            if canonical not in found:
                found.append(canonical)
    # Common shorthand and aliases are handled explicitly.
    for alias, canonical in ALIASES.items():
        if re.search(r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])", normalized):
            if canonical not in found:
                found.append(canonical)
    return sorted(set(found), key=str.lower)

def _similarity(resume_text: str, job_description: str) -> float:
    try:
        matrix = TfidfVectorizer(stop_words="english", ngram_range=(1, 2)).fit_transform(
            [resume_text, job_description]
        )
        return round(float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0] * 100), 1)
    except ValueError:
        return 0.0

def _experience_relevance(resume_text: str, job_description: str) -> float:
    keywords = [
        "internship", "intern", "experience", "project", "developed", "built",
        "implemented", "deployed", "team", "production", "research", "led"
    ]
    resume = _normalise(resume_text)
    job = _normalise(job_description)
    required = [word for word in keywords if word in job]
    if not required:
        required = keywords
    hits = sum(1 for word in required if word in resume)
    return round(100 * hits / len(required), 1) if required else 0.0

def _learning_plan(missing_skills: list[str]) -> list[dict[str, str]]:
    plan = []
    for skill in missing_skills[:8]:
        plan.append({
            "skill": skill,
            "action": LEARNING_RESOURCES.get(
                skill, f"Study {skill} fundamentals, complete a small hands-on exercise, and add the result to a project."
            ),
            "deliverable": f"Create a small practice task or project demonstrating {skill}."
        })
    if not plan:
        plan.append({
            "skill": "Interview preparation",
            "action": "Review the job description, practice explaining your projects, and solve role-relevant interview questions.",
            "deliverable": "Prepare a concise project walkthrough and a set of practice answers."
        })
    return plan

def analyze_resume(resume_text: str, job_description: str) -> dict:
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)
    resume_set, job_set = set(resume_skills), set(job_skills)
    matched = sorted(resume_set & job_set, key=str.lower)
    missing = sorted(job_set - resume_set, key=str.lower)
    coverage = round(100 * len(matched) / len(job_set), 1) if job_set else 0.0
    semantic = _similarity(resume_text, job_description)
    experience = _experience_relevance(resume_text, job_description)
    # Explainable heuristic; not a probability of receiving an interview or offer.
    overall = round(0.60 * coverage + 0.30 * semantic + 0.10 * experience, 1)
    return {
        "match_score": overall,
        "skill_coverage": coverage,
        "semantic_similarity": semantic,
        "experience_relevance": experience,
        "matched_skills": matched,
        "missing_skills": missing,
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "learning_plan": _learning_plan(missing),
    }
