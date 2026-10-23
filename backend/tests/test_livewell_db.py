import pytest
from fastapi.testclient import TestClient
from main import app
from database.db_service import LiveWellDBService

client = TestClient(app)


def test_db_service_overview():
    overview = LiveWellDBService.get_overview()
    assert "LIVE WELL" in overview["metadata"]["title"]
    assert "Murthy Gokula" in overview["metadata"]["author"]
    assert overview["pillars_count"] == 6
    assert overview["habits_count"] == 8
    assert overview["quizzes_count"] == 7


def test_api_livewell_overview():
    response = client.get("/api/v1/livewell/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["pillars_count"] == 6
    assert data["habits_count"] == 8
    assert data["quizzes_count"] == 7


def test_api_livewell_habits():
    response = client.get("/api/v1/livewell/habits")
    assert response.status_code == 200
    habits = response.json()
    assert len(habits) == 8
    names = [h["superhero_name"] for h in habits]
    assert "The Movement Master" in names
    assert "The Fuel Captain" in names
    assert "The Gut Guardian" in names
    assert "The Energy Maker" in names
    assert "The Sleep Guardian" in names
    assert "The Stress Fighter" in names
    assert "The Connection Champion" in names
    assert "The Body Protector" in names


def test_api_livewell_quizzes():
    response = client.get("/api/v1/livewell/quizzes")
    assert response.status_code == 200
    quizzes = response.json()
    assert len(quizzes) == 7
    codes = [q["quiz_code"] for q in quizzes]
    assert "INSULIN_RESISTANCE" in codes
    assert "HORMONE_HEALTH" in codes
    assert "TOXIN_RISK" in codes
    assert "GUT_HEALTH" in codes
    assert "GENETICS_EPIGENETICS" in codes
    assert "MITOCHONDRIAL_HEALTH" in codes
    assert "STEM_CELL_VITALITY" in codes


def test_api_livewell_single_quiz():
    response = client.get("/api/v1/livewell/quizzes/INSULIN_RESISTANCE")
    assert response.status_code == 200
    quiz = response.json()
    assert quiz["quiz_code"] == "INSULIN_RESISTANCE"
    assert len(quiz["questions"]) == 10
    assert len(quiz["scoring_rules"]) == 3


def test_api_livewell_evaluate_quiz_high_risk():
    payload = {
        "user_id": "patient_test_001",
        "answers": {
            "1": 1, "2": 1, "3": 1, "4": 1, "5": 1,
            "6": 1, "7": 1, "8": 1, "9": 1, "10": 1
        }
    }
    response = client.post("/api/v1/livewell/quizzes/INSULIN_RESISTANCE/evaluate", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert result["total_score"] == 10
    assert result["risk_level"] == "High"
    assert "Consult physician" in result["recommended_actions"]
    assert "pre-diabetes" in result["clinical_interpretation"].lower()


def test_api_livewell_evaluate_quiz_low_risk():
    payload = {
        "user_id": "patient_test_002",
        "answers": {
            "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
            "6": 0, "7": 0, "8": 0, "9": 0, "10": 0
        }
    }
    response = client.post("/api/v1/livewell/quizzes/INSULIN_RESISTANCE/evaluate", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert result["total_score"] == 0
    assert result["risk_level"] == "Low"
    assert "Optimal insulin sensitivity" in result["clinical_interpretation"]


def test_api_livewell_evaluate_gut_health():
    # 4-point scale (0 to 3)
    payload = {
        "user_id": "patient_test_003",
        "answers": {
            "1": 2, "2": 2, "3": 1, "4": 2, "5": 1,
            "6": 2, "7": 1, "8": 2, "9": 1, "10": 2
        }
    }
    response = client.post("/api/v1/livewell/quizzes/GUT_HEALTH/evaluate", json=payload)
    assert response.status_code == 200
    result = response.json()
    # 2+2+1+2+1+2+1+2+1+2 = 16 (Moderate Risk: 16-23)
    assert result["total_score"] == 16
    assert result["risk_level"] == "Moderate"


def test_api_livewell_supplements():
    response = client.get("/api/v1/livewell/supplements")
    assert response.status_code == 200
    supps = response.json()
    assert len(supps) >= 8
    names = [s["name"] for s in supps]
    assert any("Curcumin" in n for n in names)
    assert any("Omega-3" in n for n in names)


def test_api_livewell_labs():
    response = client.get("/api/v1/livewell/labs")
    assert response.status_code == 200
    labs = response.json()
    assert len(labs) >= 10

    # Filter by insurance
    response_ins = client.get("/api/v1/livewell/labs?category=Insurance+Covered")
    assert response_ins.status_code == 200
    for lab in response_ins.json():
        assert lab["coverage_category"] == "Insurance Covered"


def test_api_livewell_microhabits():
    response = client.get("/api/v1/livewell/microhabits")
    assert response.status_code == 200
    habits = response.json()
    assert len(habits) >= 30

    # Filter by driver
    response_gut = client.get("/api/v1/livewell/microhabits?driver_name=Gut+Health")
    assert response_gut.status_code == 200
    for h in response_gut.json():
        assert h["driver_name"] == "Gut Health"
