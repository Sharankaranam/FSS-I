from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException, Query, Response
from pydantic import BaseModel, Field

from database.planner_service import PlannerService

router = APIRouter(prefix="/api/v1", tags=["Planner: profiles, tasks, check-ins"])

LoadType = Literal["High", "Moderate", "Low"]


class ProfileIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)


class Profile(BaseModel):
    id: str
    name: str
    created_at: str


class TaskIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: str = Field(default="General", max_length=60)
    load_type: LoadType = "Moderate"
    estimated_mins: int = Field(default=30, gt=0, le=24 * 60)


class TaskPatch(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    category: Optional[str] = Field(default=None, max_length=60)
    load_type: Optional[LoadType] = None
    estimated_mins: Optional[int] = Field(default=None, gt=0, le=24 * 60)
    done: Optional[bool] = None


class Task(BaseModel):
    id: int
    user_id: str
    title: str
    category: str
    load_type: LoadType
    estimated_mins: int
    done: bool
    created_at: str


class CheckinIn(BaseModel):
    fatigue_state: str
    stress_state: str
    sleep_state: str
    task_complexity_state: str
    score: float = Field(..., ge=0, le=100)
    y_left: float = Field(..., ge=0, le=100)
    y_right: float = Field(..., ge=0, le=100)


class Checkin(CheckinIn):
    id: int
    user_id: str
    created_at: str


def _require_profile(pid: str) -> None:
    if not PlannerService.get_profile(pid):
        raise HTTPException(status_code=404, detail=f"Profile '{pid}' not found")


# ---------------- Profiles ----------------
@router.get("/profiles", response_model=List[Profile])
def list_profiles():
    return PlannerService.list_profiles()


@router.post("/profiles", response_model=Profile, status_code=201)
def create_profile(body: ProfileIn):
    return PlannerService.create_profile(body.name.strip())


@router.get("/profiles/{pid}", response_model=Profile)
def get_profile(pid: str):
    p = PlannerService.get_profile(pid)
    if not p:
        raise HTTPException(status_code=404, detail=f"Profile '{pid}' not found")
    return p


@router.patch("/profiles/{pid}", response_model=Profile)
def rename_profile(pid: str, body: ProfileIn):
    _require_profile(pid)
    return PlannerService.rename_profile(pid, body.name.strip())


@router.delete("/profiles/{pid}", status_code=204)
def delete_profile(pid: str):
    if not PlannerService.delete_profile(pid):
        raise HTTPException(status_code=404, detail=f"Profile '{pid}' not found")
    return Response(status_code=204)


# ---------------- Tasks ----------------
@router.get("/users/{pid}/tasks", response_model=List[Task])
def list_tasks(pid: str):
    _require_profile(pid)
    return PlannerService.list_tasks(pid)


@router.post("/users/{pid}/tasks", response_model=Task, status_code=201)
def create_task(pid: str, body: TaskIn):
    _require_profile(pid)
    return PlannerService.create_task(pid, body.title.strip(), body.category.strip() or "General", body.load_type, body.estimated_mins)


@router.patch("/users/{pid}/tasks/{task_id}", response_model=Task)
def update_task(pid: str, task_id: int, body: TaskPatch):
    _require_profile(pid)
    t = PlannerService.update_task(pid, task_id, body.model_dump(exclude_unset=True))
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    return t


@router.delete("/users/{pid}/tasks/{task_id}", status_code=204)
def delete_task(pid: str, task_id: int):
    _require_profile(pid)
    if not PlannerService.delete_task(pid, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return Response(status_code=204)


# ---------------- Check-ins ----------------
@router.get("/users/{pid}/checkins", response_model=List[Checkin])
def list_checkins(pid: str, days: int = Query(default=7, ge=1, le=90)):
    _require_profile(pid)
    return PlannerService.list_checkins(pid, days)


@router.post("/users/{pid}/checkins", response_model=Checkin, status_code=201)
def record_checkin(pid: str, body: CheckinIn):
    """Records a check-in. One made within 10 minutes of the previous one replaces it."""
    _require_profile(pid)
    return PlannerService.record_checkin(pid, body.model_dump())
