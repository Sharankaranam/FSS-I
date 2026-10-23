import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).parent.resolve()
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from fuzzy_engine import (
    FATIGUE_SETS,
    STRESS_SETS,
    SLEEP_SETS,
    TASK_COMPLEXITY_SETS,
    evaluate_rules,
    karnik_mendel_type_reduction,
)

app = FastAPI(
    title="Computing with Words (CWW) Behavioral Load Manager API",
    description="Interval Type-2 Fuzzy Inference Engine with Karnik-Mendel Type-Reduction, Rule Highlighting & Centroids",
    version="2.1.0",
)

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers.livewell import router as livewell_router
app.include_router(livewell_router)


class EvaluateLoadRequest(BaseModel):
    user_id: str = Field(default="u_12345", description="User Identifier")
    fatigue_state: str = Field(
        default="Drained",
        description="Linguistic term for Fatigue ('Energized', 'Drained', 'Exhausted')",
    )
    stress_state: str = Field(
        default="Pressured",
        description="Linguistic term for Stress ('Relaxed', 'Pressured', 'Overwhelmed')",
    )
    sleep_state: str = Field(
        default="Restless",
        description="Linguistic term for Sleep Quality ('Restful', 'Restless', 'Deprived')",
    )
    task_complexity_state: str = Field(
        default="Challenging",
        description="Linguistic term for Task Demand ('Routine', 'Challenging', 'Intense')",
    )
    fatigue_numeric: Optional[float] = Field(
        default=None, ge=0.0, le=100.0, description="Optional continuous numeric value"
    )
    stress_numeric: Optional[float] = Field(
        default=None, ge=0.0, le=100.0, description="Optional continuous numeric value"
    )
    sleep_numeric: Optional[float] = Field(
        default=None, ge=0.0, le=100.0, description="Optional continuous numeric value"
    )
    task_complexity_numeric: Optional[float] = Field(
        default=None, ge=0.0, le=100.0, description="Optional continuous numeric value"
    )


class RuleFiringDetail(BaseModel):
    rule_id: int
    rule_text: str
    justification: str
    consequent: str
    operator: str
    f_lower: float
    f_upper: float
    is_triggered: bool
    is_top_rule: bool


class FOUCurves(BaseModel):
    domain: List[float]
    aggregated_umf: List[float]
    aggregated_lmf: List[float]


class EvaluateLoadResponse(BaseModel):
    user_id: str
    fatigue_state: str
    stress_state: str
    sleep_state: str
    task_complexity_state: str
    cognitive_load_score: float
    recommended_action: str
    km_iterations: int
    km_iterations_left: int
    km_iterations_right: int
    y_left: float
    y_right: float
    top_rule_ids: List[int]
    triggered_rules_count: int
    rule_firings: List[RuleFiringDetail]
    fou_curves: FOUCurves


@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "CWW Behavioral Load Manager (IT2 Fuzzy Logic - 12 Rules Coverage)",
        "version": "2.1.0",
    }


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/v1/evaluate_load", response_model=EvaluateLoadResponse)
def evaluate_load(req: EvaluateLoadRequest):
    # Input state validations
    if req.fatigue_state not in FATIGUE_SETS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid fatigue_state '{req.fatigue_state}'. Must be one of {list(FATIGUE_SETS.keys())}",
        )
    if req.stress_state not in STRESS_SETS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stress_state '{req.stress_state}'. Must be one of {list(STRESS_SETS.keys())}",
        )
    if req.sleep_state not in SLEEP_SETS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sleep_state '{req.sleep_state}'. Must be one of {list(SLEEP_SETS.keys())}",
        )
    if req.task_complexity_state not in TASK_COMPLEXITY_SETS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid task_complexity_state '{req.task_complexity_state}'. Must be one of {list(TASK_COMPLEXITY_SETS.keys())}",
        )

    # 1. Rule Base Evaluation & Aggregation across 12 rules
    rule_eval = evaluate_rules(
        fatigue_state=req.fatigue_state,
        stress_state=req.stress_state,
        sleep_state=req.sleep_state,
        task_complexity_state=req.task_complexity_state,
        fatigue_numeric=req.fatigue_numeric,
        stress_numeric=req.stress_numeric,
        sleep_numeric=req.sleep_numeric,
        task_complexity_numeric=req.task_complexity_numeric,
    )

    domain = rule_eval["domain"]
    agg_umf = rule_eval["agg_umf"]
    agg_lmf = rule_eval["agg_lmf"]

    # 2. Karnik-Mendel Type Reduction
    km_res = karnik_mendel_type_reduction(x=domain, umf=agg_umf, lmf=agg_lmf)

    score = km_res["y_crisp"]

    # 3. Determine Recommended Action
    recommended_action = "defer_deep_work" if score > 65.0 else "normal_schedule"

    total_km_iters = max(km_res["iterations_left"], km_res["iterations_right"])
    triggered_count = sum(1 for r in rule_eval["rule_firings"] if r["is_triggered"])

    return EvaluateLoadResponse(
        user_id=req.user_id,
        fatigue_state=req.fatigue_state,
        stress_state=req.stress_state,
        sleep_state=req.sleep_state,
        task_complexity_state=req.task_complexity_state,
        cognitive_load_score=round(score, 1),
        recommended_action=recommended_action,
        km_iterations=total_km_iters,
        km_iterations_left=km_res["iterations_left"],
        km_iterations_right=km_res["iterations_right"],
        y_left=km_res["y_left"],
        y_right=km_res["y_right"],
        top_rule_ids=rule_eval["top_rule_ids"],
        triggered_rules_count=triggered_count,
        rule_firings=rule_eval["rule_firings"],
        fou_curves=FOUCurves(
            domain=[round(val, 1) for val in domain.tolist()],
            aggregated_umf=[round(val, 4) for val in agg_umf.tolist()],
            aggregated_lmf=[round(val, 4) for val in agg_lmf.tolist()],
        ),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

