# AI-Powered Job Match & Resume Analyzer

A full-stack portfolio project that parses PDF resumes, compares them with job descriptions, explains matched and missing skills, creates a practical learning plan, and saves analysis history.

## Features
- PDF resume upload and text extraction (`pypdf`)
- Job-description input and controlled skill extraction
- Explainable matching indicators: required-skill coverage, experience keyword overlap, and TF-IDF cosine similarity
- Matched, missing, and additional skills
- Personalized preparation plan based on missing skills
- Saved analysis history and job comparison dashboard
- FastAPI REST API, PostgreSQL-ready persistence, SQLite local fallback
- React + TypeScript + Vite frontend
- Unit tests, Docker Compose, environment examples

> Scores are heuristic decision-support indicators, **not hiring probabilities**, guarantees of employability, or objective judgments of candidate quality. The tool does not infer protected characteristics. Validate extracted skills and text because PDF formatting can cause extraction errors.

## Architecture
- `backend/`: FastAPI API, PDF extraction, matching engine, SQLAlchemy persistence, tests
- `frontend/`: React/TypeScript single-page application
- `docker-compose.yml`: frontend, backend, PostgreSQL
- `sample_data/`: example job description (no personal resume data)

## Run locally (recommended first run)

### 1. Requirements
- Python 3.11+
- Node.js 20+
- Git
- Optional: Docker Desktop

### 2. Backend
Open a terminal in the project root:

```bash
cd backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
# .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

The default database is local SQLite (`sqlite:///./job_match.db`) so it runs without PostgreSQL. To use PostgreSQL, set `DATABASE_URL` in `backend/.env`, e.g. `postgresql+psycopg://postgres:yourpassword@localhost:5432/jobmatch`.

### 3. Frontend
In a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173). The frontend expects the API at `http://127.0.0.1:8000`; set `VITE_API_BASE_URL` in `frontend/.env` if needed.

## Run tests
From `backend/` with its virtual environment active:

```bash
pytest
```

## Run with Docker Compose
Install Docker Desktop, then from the project root:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

Docker Compose configures PostgreSQL for the backend. Change the sample database password before using this setup beyond local development.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/analyze` | Upload PDF + job description; analyze and save |
| `GET` | `/api/analyses` | List saved analyses |
| `GET` | `/api/analyses/{id}` | Fetch one analysis |
| `DELETE` | `/api/analyses/{id}` | Delete one saved analysis |

## Matching approach
1. Extract PDF text with `pypdf`.
2. Normalize text and find skills from a maintained dictionary using word-boundary matching.
3. Compute required-skill coverage from the job description's extracted skills.
4. Compute TF-IDF cosine similarity between resume text and job description.
5. Estimate experience relevance using a small overlap of experience-related keywords.
6. Generate learning recommendations for missing skills.

The dashboard displays the components separately so a user can understand why a score was produced. The combined score is a transparent weighted heuristic, not a calibrated model.

## Improve it responsibly
- Add OCR as an opt-in feature for scanned PDFs.
- Evaluate skill extraction and retrieval against a manually labeled dataset.
- Compare TF-IDF with sentence embeddings and report precision/recall or ranking metrics.
- Add authentication and per-user authorization before deploying for multiple users.
- Add rate limiting, malware scanning, file retention controls, and privacy notices for production.
- Never use this prototype as an automated hiring decision system.

## Troubleshooting
- **No text extracted:** the PDF may be scanned; this starter supports text-based PDFs. Try an OCR-enabled version or a text-based PDF.
- **Frontend cannot reach API:** confirm the backend is running on port 8000 and check `VITE_API_BASE_URL`.
- **Database connection fails:** remove `DATABASE_URL` from `.env` to use SQLite locally, or verify PostgreSQL credentials.
- **PDF rejected:** upload a PDF under 5 MB.

## License
MIT. See `LICENSE`.
