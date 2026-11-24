import pytest
from fastapi.testclient import TestClient

from main import app
from database import planner_service

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_db(tmp_path, monkeypatch):
    monkeypatch.setenv("FSS_PLANNER_DB", str(tmp_path / "planner_test.db"))


def make_profile(name="Test"):
    r = client.post("/api/v1/profiles", json={"name": name})
    assert r.status_code == 201
    return r.json()


def test_new_profile_gets_starter_tasks():
    p = make_profile("Ada")
    tasks = client.get(f"/api/v1/users/{p['id']}/tasks").json()
    assert len(tasks) == len(planner_service.STARTER_TASKS)
    assert all(t["done"] is False for t in tasks)


def test_task_crud():
    pid = make_profile()["id"]
    r = client.post(
        f"/api/v1/users/{pid}/tasks",
        json={"title": "Write thesis chapter", "category": "Deep work", "load_type": "High", "estimated_mins": 60},
    )
    assert r.status_code == 201
    task = r.json()

    r = client.patch(f"/api/v1/users/{pid}/tasks/{task['id']}", json={"done": True, "estimated_mins": 75})
    assert r.status_code == 200
    assert r.json()["done"] is True and r.json()["estimated_mins"] == 75

    assert client.delete(f"/api/v1/users/{pid}/tasks/{task['id']}").status_code == 204
    assert client.patch(f"/api/v1/users/{pid}/tasks/{task['id']}", json={"done": False}).status_code == 404


def test_task_validation_and_isolation():
    a = make_profile("A")["id"]
    b = make_profile("B")["id"]
    bad = client.post(f"/api/v1/users/{a}/tasks", json={"title": "x", "load_type": "Extreme"})
    assert bad.status_code == 422
    task = client.post(f"/api/v1/users/{a}/tasks", json={"title": "Mine"}).json()
    # Profile B cannot touch profile A's task
    assert client.delete(f"/api/v1/users/{b}/tasks/{task['id']}").status_code == 404
    assert client.get("/api/v1/users/nope/tasks").status_code == 404


def test_checkins_merge_within_window():
    pid = make_profile()["id"]
    base = {
        "fatigue_state": "Drained",
        "stress_state": "Pressured",
        "sleep_state": "Restless",
        "task_complexity_state": "Challenging",
        "y_left": 49.1,
        "y_right": 90.0,
    }
    client.post(f"/api/v1/users/{pid}/checkins", json={**base, "score": 69.5})
    client.post(f"/api/v1/users/{pid}/checkins", json={**base, "score": 30.5})
    history = client.get(f"/api/v1/users/{pid}/checkins").json()
    assert len(history) == 1
    assert history[0]["score"] == 30.5


def test_profile_rename_and_delete_cascades():
    pid = make_profile("Old")["id"]
    assert client.patch(f"/api/v1/profiles/{pid}", json={"name": "New"}).json()["name"] == "New"
    assert client.delete(f"/api/v1/profiles/{pid}").status_code == 204
    assert client.get(f"/api/v1/profiles/{pid}").status_code == 404


def test_graded_recommendation():
    mid = client.post(
        "/api/v1/evaluate_load",
        json={"fatigue_state": "Drained", "stress_state": "Relaxed", "sleep_state": "Restful", "task_complexity_state": "Routine"},
    ).json()
    assert 35 < mid["cognitive_load_score"] <= 65
    assert mid["recommended_action"] == "limit_deep_work"
