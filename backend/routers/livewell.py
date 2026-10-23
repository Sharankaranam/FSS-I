from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from database.db_service import LiveWellDBService

router = APIRouter(prefix="/api/v1/livewell", tags=["LiveWell Clinical Framework"])


class QuizEvaluateRequest(BaseModel):
    user_id: str = Field(default="guest", description="Patient/User identifier")
    answers: Dict[str, Any] = Field(
        ...,
        description="Map of question_number (1-indexed) to response value (bool, int, or string)",
        json_schema_extra={"example": {"1": 1, "2": 1, "3": 0, "4": 1, "5": 1, "6": 1, "7": 0, "8": 1, "9": 0, "10": 1}}
    )


@router.get("/overview")
def get_livewell_overview():
    """Returns high-level summary of book metadata, pillars, habits, and clinical quizzes."""
    try:
        return LiveWellDBService.get_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/habits")
def get_habits():
    """Returns the 8 Habits of Health & Happiness (The 8 Superheroes) with daily routines and checks."""
    try:
        return LiveWellDBService.get_habits()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pillars-and-hallmarks")
def get_pillars_and_hallmarks():
    """Returns 6 Lifestyle Pillars, 9 Hallmarks of Longevity, and Table 4 biological reversal mappings."""
    try:
        return LiveWellDBService.get_pillars_and_hallmarks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ashtanga-and-drivers")
def get_ashtanga_and_drivers():
    """Returns Ashtanga Yoga 8 limbs and their alignment with the 8 chronic disease drivers."""
    try:
        return LiveWellDBService.get_ashtanga_and_drivers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/microhabits")
def get_microhabits(
    driver_name: Optional[str] = Query(None, description="Filter by disease driver (e.g. 'Gut Health', 'Inflammation')"),
    step_letter: Optional[str] = Query(None, description="Filter by MY GOAL DO IT step (M, Y, G, O, A, L, D, O, I, T)")
):
    """Returns the MY GOAL DO IT microhabits catalog."""
    try:
        return LiveWellDBService.get_microhabits(driver_name=driver_name, step_letter=step_letter)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quizzes")
def get_quizzes():
    """Returns all 7 clinical quizzes with question counts and target conditions."""
    try:
        return LiveWellDBService.get_quizzes()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quizzes/{quiz_code}")
def get_quiz_details(quiz_code: str):
    """Returns full quiz questions, response options, point values, and clinical scoring rules."""
    quiz = LiveWellDBService.get_quiz_by_code(quiz_code)
    if not quiz:
        raise HTTPException(status_code=404, detail=f"Quiz '{quiz_code}' not found")
    return quiz


@router.post("/quizzes/{quiz_code}/evaluate")
def evaluate_quiz(quiz_code: str, req: QuizEvaluateRequest):
    """Evaluates user answers, computes total risk score, matches clinical triage rule, and returns recommendations."""
    try:
        # Convert keys to int if possible
        int_answers = {}
        for k, v in req.answers.items():
            try:
                int_answers[int(k)] = v
            except ValueError:
                int_answers[k] = v

        result = LiveWellDBService.evaluate_quiz(
            quiz_code=quiz_code,
            answers=int_answers,
            user_id=req.user_id
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/supplements")
def get_supplements():
    """Returns directory of evidence-based therapeutic supplements and dosages."""
    try:
        return LiveWellDBService.get_therapeutic_supplements()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/labs")
def get_labs(category: Optional[str] = Query(None, description="Filter by 'Insurance Covered' or 'Functional / Out of Pocket'")):
    """Returns directory of clinical laboratory biomarkers."""
    try:
        return LiveWellDBService.get_lab_biomarkers(category=category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
