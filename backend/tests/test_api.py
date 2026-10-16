from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_invalid_file_type():
    response = client.post(
        "/api/analyze",
        files={"resume": ("resume.txt", b"plain text", "text/plain")},
        data={"job_description": "A sufficiently long job description for validation."},
    )
    assert response.status_code == 400
