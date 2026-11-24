import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_evaluate_load_critical():
    payload = {
        "user_id": "u_test_1",
        "fatigue_state": "Drained",
        "stress_state": "Pressured",
        "sleep_state": "Restless",
        "task_complexity_state": "Challenging",
    }
    response = client.post("/api/v1/evaluate_load", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["cognitive_load_score"] > 65.0
    assert data["recommended_action"] == "defer_deep_work"
    assert "km_iterations" in data
    assert len(data["rule_firings"]) == 12
    assert data["triggered_rules_count"] >= 1
    assert len(data["top_rule_ids"]) >= 1


def test_evaluate_load_low():
    payload = {
        "user_id": "u_test_2",
        "fatigue_state": "Energized",
        "stress_state": "Relaxed",
        "sleep_state": "Restful",
        "task_complexity_state": "Routine",
    }
    response = client.post("/api/v1/evaluate_load", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["cognitive_load_score"] < 40.0
    assert data["recommended_action"] == "normal_schedule"
    assert data["triggered_rules_count"] >= 1


def test_evaluate_load_invalid_state():
    payload = {
        "user_id": "u_test_3",
        "fatigue_state": "SuperHuman",
        "stress_state": "Relaxed",
    }
    response = client.post("/api/v1/evaluate_load", json=payload)
    assert response.status_code == 400


def test_linguistic_inputs_keep_a_centroid_interval():
    """Word inputs must yield a real [y_l, y_r] interval, not a collapsed point."""
    payload = {
        "fatigue_state": "Drained",
        "stress_state": "Pressured",
        "sleep_state": "Restless",
        "task_complexity_state": "Challenging",
    }
    data = client.post("/api/v1/evaluate_load", json=payload).json()
    assert data["y_right"] - data["y_left"] > 5.0
    assert data["y_left"] <= data["cognitive_load_score"] <= data["y_right"]
    umf = data["fou_curves"]["aggregated_umf"]
    lmf = data["fou_curves"]["aggregated_lmf"]
    assert any(u - l > 1e-3 for u, l in zip(umf, lmf))
