"""
Per-user planner data: profiles, editable tasks and check-in history.

Kept in its own SQLite file (planner.db, git-ignored) so personal data never mixes with
the curated LiveWell knowledge base. Set FSS_PLANNER_DB to point somewhere else (tests do).
"""

import os
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "planner.db")

LOAD_TYPES = ("High", "Moderate", "Low")

# Check-ins closer together than this replace the previous one, so tweaking inputs
# for a few minutes produces one history point instead of dozens.
CHECKIN_MERGE_WINDOW = timedelta(minutes=10)

STARTER_TASKS = [
    ("Write system architecture documentation", "Deep work", "High", 90),
    ("Reply to team messages and emails", "Communication", "Low", 20),
    ("Review pull requests for the fuzzy engine", "Code review", "Moderate", 45),
    ("Refactor Karnik-Mendel matrix operations", "Deep work", "High", 120),
    ("Organize desktop and workspace files", "Admin", "Low", 15),
]

SCHEMA = """
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    load_type TEXT NOT NULL CHECK (load_type IN ('High', 'Moderate', 'Low')),
    estimated_mins INTEGER NOT NULL CHECK (estimated_mins > 0),
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    fatigue_state TEXT NOT NULL,
    stress_state TEXT NOT NULL,
    sleep_state TEXT NOT NULL,
    task_complexity_state TEXT NOT NULL,
    score REAL NOT NULL,
    y_left REAL NOT NULL,
    y_right REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_checkins_user_time ON checkins(user_id, created_at);
"""


def _db_path() -> str:
    return os.environ.get("FSS_PLANNER_DB", DEFAULT_DB_PATH)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    return conn


def _task_row(r: sqlite3.Row) -> Dict[str, Any]:
    d = dict(r)
    d["done"] = bool(d["done"])
    return d


class PlannerService:
    # ---------------- Profiles ----------------
    @staticmethod
    def create_profile(name: str, seed_tasks: bool = True) -> Dict[str, Any]:
        pid = uuid.uuid4().hex[:12]
        now = _now().isoformat()
        with get_conn() as conn:
            conn.execute("INSERT INTO profiles (id, name, created_at) VALUES (?, ?, ?)", (pid, name, now))
            if seed_tasks:
                conn.executemany(
                    "INSERT INTO tasks (user_id, title, category, load_type, estimated_mins, created_at)"
                    " VALUES (?, ?, ?, ?, ?, ?)",
                    [(pid, t, c, lt, m, now) for t, c, lt, m in STARTER_TASKS],
                )
        return {"id": pid, "name": name, "created_at": now}

    @staticmethod
    def list_profiles() -> List[Dict[str, Any]]:
        with get_conn() as conn:
            return [dict(r) for r in conn.execute("SELECT * FROM profiles ORDER BY created_at")]

    @staticmethod
    def get_profile(pid: str) -> Optional[Dict[str, Any]]:
        with get_conn() as conn:
            r = conn.execute("SELECT * FROM profiles WHERE id = ?", (pid,)).fetchone()
            return dict(r) if r else None

    @staticmethod
    def rename_profile(pid: str, name: str) -> Optional[Dict[str, Any]]:
        with get_conn() as conn:
            conn.execute("UPDATE profiles SET name = ? WHERE id = ?", (name, pid))
        return PlannerService.get_profile(pid)

    @staticmethod
    def delete_profile(pid: str) -> bool:
        with get_conn() as conn:
            return conn.execute("DELETE FROM profiles WHERE id = ?", (pid,)).rowcount > 0

    # ---------------- Tasks ----------------
    @staticmethod
    def list_tasks(pid: str) -> List[Dict[str, Any]]:
        with get_conn() as conn:
            rows = conn.execute("SELECT * FROM tasks WHERE user_id = ? ORDER BY id", (pid,))
            return [_task_row(r) for r in rows]

    @staticmethod
    def create_task(pid: str, title: str, category: str, load_type: str, estimated_mins: int) -> Dict[str, Any]:
        with get_conn() as conn:
            cur = conn.execute(
                "INSERT INTO tasks (user_id, title, category, load_type, estimated_mins, created_at)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (pid, title, category, load_type, estimated_mins, _now().isoformat()),
            )
            r = conn.execute("SELECT * FROM tasks WHERE id = ?", (cur.lastrowid,)).fetchone()
            return _task_row(r)

    @staticmethod
    def update_task(pid: str, task_id: int, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        allowed = {"title", "category", "load_type", "estimated_mins", "done"}
        updates = {k: (int(v) if k == "done" else v) for k, v in fields.items() if k in allowed and v is not None}
        with get_conn() as conn:
            if updates:
                cols = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE tasks SET {cols} WHERE id = ? AND user_id = ?",
                    (*updates.values(), task_id, pid),
                )
            r = conn.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, pid)).fetchone()
            return _task_row(r) if r else None

    @staticmethod
    def delete_task(pid: str, task_id: int) -> bool:
        with get_conn() as conn:
            return conn.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, pid)).rowcount > 0

    # ---------------- Check-ins ----------------
    @staticmethod
    def record_checkin(pid: str, data: Dict[str, Any]) -> Dict[str, Any]:
        now = _now()
        values = (
            data["fatigue_state"],
            data["stress_state"],
            data["sleep_state"],
            data["task_complexity_state"],
            data["score"],
            data["y_left"],
            data["y_right"],
        )
        with get_conn() as conn:
            last = conn.execute(
                "SELECT id, created_at FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", (pid,)
            ).fetchone()
            if last and now - datetime.fromisoformat(last["created_at"]) < CHECKIN_MERGE_WINDOW:
                conn.execute(
                    "UPDATE checkins SET created_at = ?, fatigue_state = ?, stress_state = ?, sleep_state = ?,"
                    " task_complexity_state = ?, score = ?, y_left = ?, y_right = ? WHERE id = ?",
                    (now.isoformat(), *values, last["id"]),
                )
                cid = last["id"]
            else:
                cid = conn.execute(
                    "INSERT INTO checkins (user_id, created_at, fatigue_state, stress_state, sleep_state,"
                    " task_complexity_state, score, y_left, y_right) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (pid, now.isoformat(), *values),
                ).lastrowid
            return dict(conn.execute("SELECT * FROM checkins WHERE id = ?", (cid,)).fetchone())

    @staticmethod
    def list_checkins(pid: str, days: int = 7) -> List[Dict[str, Any]]:
        since = (_now() - timedelta(days=days)).isoformat()
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM checkins WHERE user_id = ? AND created_at >= ? ORDER BY created_at",
                (pid, since),
            )
            return [dict(r) for r in rows]
