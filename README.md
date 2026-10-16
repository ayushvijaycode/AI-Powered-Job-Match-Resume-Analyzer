# RoleFit — AI-Powered Job Match & Resume Analyzer

<p align="center">
  <strong>Understand your fit for a role. Find skill gaps. Build your next-step plan.</strong>
</p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white">
  <img alt="scikit-learn" src="https://img.shields.io/badge/ML-scikit--learn-F7931E?logo=scikitlearn&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/DevOps-Docker-2496ED?logo=docker&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green.svg">
</p>

RoleFit is a full-stack portfolio project that compares a text-based PDF resume with a job description. It identifies skills found in both documents, highlights potential gaps, calculates explainable matching indicators, and suggests practical next steps.

> **Important:** Match scores are heuristic decision-support indicators, not probabilities of getting hired or guarantees of employability. Always review the extracted text and recommendations yourself.

## Contents
- [Features](#features)
- [Product preview](#product-preview)
- [Tech stack](#tech-stack)
- [How matching works](#how-matching-works)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Run tests](#run-tests)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Limitations and responsible use](#limitations-and-responsible-use)
- [Roadmap](#roadmap)
- [License](#license)

## Features
- **PDF resume parsing:** extract text from text-based PDFs using `pypdf`.
- **Job description analysis:** paste a job description and provide a role title.
- **Skill extraction:** detect skills using a maintained, controlled dictionary.
- **Explainable matching:** show skill coverage, TF-IDF cosine similarity, and experience-keyword overlap separately.
- **Skill gap analysis:** display matched skills and skills detected in the job description but not in the resume text.
- **Preparation plan:** generate suggested learning actions and practical deliverables for missing skills.
- **Analysis history:** save, reopen, compare, and delete previous analyses.
- **REST API:** expose analysis and history operations through FastAPI.
- **Database flexibility:** use SQLite locally or configure PostgreSQL.
- **Developer tooling:** pytest tests, Dockerfiles, Docker Compose, and environment examples.

## Product preview

Add screenshots of your **actual running application** to `docs/screenshots/`, then uncomment and update the image paths below.

<!--
<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="RoleFit dashboard" width="850">
</p>
<p align="center">
  <img src="docs/screenshots/analysis-results.png" alt="RoleFit analysis results" width="850">
</p>
-->

Suggested screenshots:
1. `dashboard.png` — the new-analysis form.
2. `analysis-results.png` — match score and metric cards.
3. `skills-comparison.png` — matched and missing skills.
4. `preparation-plan.png` — learning recommendations.

Use a fictional/sample resume or redact personal details before publishing screenshots.

## Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React, TypeScript, Vite | Interactive dashboard |
| Backend | Python, FastAPI | REST endpoints and validation |
| PDF parsing | pypdf | Extract text from PDF resumes |
| Matching | scikit-learn | TF-IDF and cosine similarity |
| Skill extraction | Python regular expressions and controlled dictionary | Detect known skills |
| Persistence | SQLAlchemy, SQLite / PostgreSQL | Save analysis history |
| Testing | pytest, FastAPI TestClient | Test matching and API behavior |
| Development | Git, Docker, Docker Compose | Version control and local setup |

## How matching works

1. Extract text from the uploaded PDF.
2. Detect known skills in the resume and job description using a controlled dictionary.
3. Calculate skill coverage as the proportion of detected job skills also detected in the resume.
4. Calculate text similarity using TF-IDF vectors and cosine similarity.
5. Estimate experience-keyword overlap using a small set of experience-related terms.
6. Generate a preparation plan from detected missing skills.

The current combined score is a transparent, hand-weighted heuristic:
- Skill coverage: **60%**
- TF-IDF text similarity: **30%**
- Experience-keyword overlap: **10%**

These weights are **not calibrated against hiring outcomes**. The dictionary can miss synonyms or detect terms without understanding context. A missing skill means it was not detected in extracted resume text; it does not prove the candidate lacks that skill.

## Architecture

```text
React + TypeScript (Vite)
          |
          | HTTP / JSON + multipart PDF upload
          v
       FastAPI
          |
          +--> pypdf text extraction
          +--> skill dictionary + TF-IDF matcher
          +--> learning-plan generation
          |
          v
SQLAlchemy --> SQLite (default) / PostgreSQL (configured)
```

## Getting started

### Prerequisites
- Python 3.11 or newer
- Node.js 20 or newer (includes npm)
- Git
- Optional: Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-Powered-Job-Match-Resume-Analyzer.git
cd AI-Powered-Job-Match-Resume-Analyzer
```

Replace `YOUR_USERNAME` with the GitHub account that owns the repository.

### 2. Start the backend

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

API: `http://127.0.0.1:8000`  
Interactive API docs: `http://127.0.0.1:8000/docs`

SQLite is the default database, so PostgreSQL is not required for a first local run.

### 3. Start the frontend

Open a **second terminal** from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend defaults to `http://127.0.0.1:8000` for the API. To override it, create `frontend/.env` based on `frontend/.env.example` and set `VITE_API_BASE_URL`.

### 4. Try an analysis
1. Upload a text-based PDF resume smaller than 5 MB.
2. Paste a job description of at least 40 characters.
3. Click **Analyze my fit**.
4. Review the score components, matched skills, missing skills, and preparation plan.
5. Run another analysis to explore saved history and comparisons.

Scanned/image-only PDFs are not supported because OCR is not enabled.

## Run tests

From `backend/` with the virtual environment activated:

```bash
pytest
```

The tests cover skill extraction, bounded heuristic scores, the health endpoint, and invalid upload handling. Run the tests in your own environment before relying on them as a release check.

## API reference

With the backend running, open `http://127.0.0.1:8000/docs` for interactive Swagger documentation.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API health check |
| `POST` | `/api/analyze` | Upload a PDF and analyze it against a job description |
| `GET` | `/api/analyses` | List recent saved analyses |
| `GET` | `/api/analyses/{id}` | Retrieve one saved analysis |
| `DELETE` | `/api/analyses/{id}` | Delete one saved analysis |

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI endpoints
│   │   ├── matcher.py       # Skill extraction and matching indicators
│   │   ├── parser.py        # PDF text extraction
│   │   ├── models.py        # SQLAlchemy model
│   │   ├── schemas.py       # API response schemas
│   │   ├── database.py      # Database setup
│   │   └── config.py        # Environment configuration
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── styles.css
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── package.json
│   └── Dockerfile
├── sample_data/
├── docker-compose.yml
├── PROJECT_INFO.md
├── README.md
└── LICENSE
```

## Limitations and responsible use

- **Text-based PDFs only:** scanned PDFs require OCR, which is not implemented.
- **Controlled skill vocabulary:** skills outside the dictionary and many synonyms may not be recognized.
- **Heuristic scores:** weights are not trained or calibrated against hiring outcomes.
- **Simple experience signal:** keyword overlap does not verify the length or quality of experience.
- **Single-user development MVP:** authentication and per-user authorization are not implemented. Do not expose this version publicly for real resumes without access control, secure file handling, retention/deletion policies, rate limiting, and privacy notices.
- **Human review required:** intended for job-seeker preparation, not automated hiring decisions.

## Roadmap
- [ ] Add authentication and per-user analysis isolation.
- [ ] Add opt-in OCR support for scanned resumes.
- [ ] Expand skill taxonomy and synonym handling.
- [ ] Compare TF-IDF with sentence embeddings on a manually labeled evaluation set.
- [ ] Report retrieval metrics and document evaluation methodology.
- [ ] Add CI with automated tests and frontend build checks.
- [ ] Deploy a demo with privacy-conscious sample data.

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE).
