import numpy as np
from typing import Tuple, List, Union


def trapmf(x: np.ndarray, params: List[float]) -> np.ndarray:
    """
    Trapezoidal membership function evaluation.
    params: [a, b, c, d]
    - a: left foot
    - b: left shoulder
    - c: right shoulder
    - d: right foot
    """
    a, b, c, d = [float(p) for p in params]
    x_arr = np.asarray(x, dtype=np.float64)
    y = np.zeros_like(x_arr, dtype=np.float64)

    # Left slope
    if b > a:
        idx_left = (x_arr >= a) & (x_arr < b)
        y[idx_left] = (x_arr[idx_left] - a) / (b - a)
    elif a == b:
        idx_left = (x_arr <= b)
        y[idx_left] = 1.0

    # Top plateau
    idx_top = (x_arr >= b) & (x_arr <= c)
    y[idx_top] = 1.0

    # Right slope
    if d > c:
        idx_right = (x_arr > c) & (x_arr <= d)
        y[idx_right] = (d - x_arr[idx_right]) / (d - c)
    elif c == d:
        idx_right = (x_arr >= c)
        y[idx_right] = 1.0

    # Boundary handling for exact 0 and 100 limits
    if a == 0 and b == 0:
        y[x_arr <= c] = 1.0
    if c == 100 and d == 100:
        y[x_arr >= b] = 1.0

    return np.clip(y, 0.0, 1.0)


class IT2FuzzySet:
    """
    Represents an Interval Type-2 Fuzzy Set with Upper Membership Function (UMF),
    Lower Membership Function (LMF), and academic justification metadata.
    """

    def __init__(
        self,
        name: str,
        umf_params: List[float],
        lmf_params: List[float],
        justification: str = "",
    ):
        self.name = name
        self.umf_params = umf_params
        self.lmf_params = lmf_params
        self.justification = justification

    def evaluate_scalar(self, val: float) -> Tuple[float, float]:
        """
        Evaluates membership values at a crisp scalar input.
        Returns: (umf_val, lmf_val)
        """
        arr = np.array([val], dtype=np.float64)
        umf_val = float(trapmf(arr, self.umf_params)[0])
        lmf_val = float(trapmf(arr, self.lmf_params)[0])
        # Ensure LMF <= UMF due to floating point precision
        lmf_val = min(lmf_val, umf_val)
        return umf_val, lmf_val

    def evaluate_domain(self, x_domain: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Evaluates membership values across a domain array.
        Returns: (umf_array, lmf_array)
        """
        umf = trapmf(x_domain, self.umf_params)
        lmf = trapmf(x_domain, self.lmf_params)
        lmf = np.minimum(lmf, umf)
        return umf, lmf


# =====================================================================
# Driver 1: Fatigue Level (Physical & Mental Exhaustion)
# Mapped from Samn-Perelli 7-Point Fatigue Scale & Stanford Sleepiness Scale
# =====================================================================
FATIGUE_SETS = {
    "Energized": IT2FuzzySet(
        name="Energized",
        umf_params=[0.0, 0.0, 30.0, 50.0],
        lmf_params=[0.0, 0.0, 20.0, 40.0],
        justification="Samn-Perelli levels 1-2 (alert, active). LMF core [0, 20] guarantees 1.0 membership for optimal vigor.",
    ),
    "Drained": IT2FuzzySet(
        name="Drained",
        umf_params=[30.0, 45.0, 55.0, 70.0],
        lmf_params=[40.0, 50.0, 50.0, 60.0],
        justification="Samn-Perelli levels 3-4 (okay, somewhat tired). Cognitive processing speed decelerates by 15-25%. LMF core [50, 50] centers on scale midpoint.",
    ),
    "Exhausted": IT2FuzzySet(
        name="Exhausted",
        umf_params=[55.0, 75.0, 100.0, 100.0],
        lmf_params=[65.0, 85.0, 100.0, 100.0],
        justification="Samn-Perelli levels 5-7 (extremely tired, impairment). Working memory degrades exponentially beyond 75%. LMF core [85, 100] forces critical load.",
    ),
}

# =====================================================================
# Driver 2: Stress Level (Perceived Psychological Pressure)
# Mapped from Cohen's Perceived Stress Scale (PSS) & Yerkes-Dodson Law
# =====================================================================
STRESS_SETS = {
    "Relaxed": IT2FuzzySet(
        name="Relaxed",
        umf_params=[0.0, 0.0, 35.0, 55.0],
        lmf_params=[0.0, 0.0, 25.0, 45.0],
        justification="Parasympathetic dominance. LMF core [0, 25] represents baseline calm. UMF extends to 55 to allow mild positive eustress.",
    ),
    "Pressured": IT2FuzzySet(
        name="Pressured",
        umf_params=[35.0, 50.0, 60.0, 80.0],
        lmf_params=[45.0, 55.0, 55.0, 70.0],
        justification="Optimal performance zone under Yerkes-Dodson. UMF span [35, 80] captures subjective range where users feel deadline urgency without emotional breakdown.",
    ),
    "Overwhelmed": IT2FuzzySet(
        name="Overwhelmed",
        umf_params=[60.0, 80.0, 100.0, 100.0],
        lmf_params=[75.0, 90.0, 100.0, 100.0],
        justification="Acute distress where cortisol impairs prefrontal cortex executive control. LMF core [90, 100] ensures immediate critical load assignment.",
    ),
}

# =====================================================================
# Driver 3: Sleep Quality (Restorative Sleep Deficit)
# Mapped from Pittsburgh Sleep Quality Index (PSQI) & Dawson-Reid Debt Model
# =====================================================================
SLEEP_SETS = {
    "Restful": IT2FuzzySet(
        name="Restful",
        umf_params=[0.0, 0.0, 30.0, 50.0],
        lmf_params=[0.0, 0.0, 20.0, 40.0],
        justification="Full REM & slow-wave sleep recovery (PSQI < 5). Maximum synaptic homeostasis and memory consolidation.",
    ),
    "Restless": IT2FuzzySet(
        name="Restless",
        umf_params=[30.0, 45.0, 55.0, 70.0],
        lmf_params=[40.0, 50.0, 50.0, 60.0],
        justification="Partial sleep fragmentation (PSQI 5-10). Attentional lapses increase by 30%.",
    ),
    "Deprived": IT2FuzzySet(
        name="Deprived",
        umf_params=[55.0, 75.0, 100.0, 100.0],
        lmf_params=[65.0, 85.0, 100.0, 100.0],
        justification="Severe sleep debt (> 24h wakefulness or PSQI > 10). Cognitive deficit is equivalent to 0.10% BAC (Dawson & Reid).",
    ),
}

# =====================================================================
# Driver 4: Task Complexity (External Mental Workload Demand)
# Mapped from NASA Task Load Index (NASA-TLX) & Cowan's Working Memory Model
# =====================================================================
TASK_COMPLEXITY_SETS = {
    "Routine": IT2FuzzySet(
        name="Routine",
        umf_params=[0.0, 0.0, 35.0, 55.0],
        lmf_params=[0.0, 0.0, 25.0, 45.0],
        justification="Minimal working memory load (1-2 items in Cowan's 4-chunk model). Admin, repetitive sorting, simple replies.",
    ),
    "Challenging": IT2FuzzySet(
        name="Challenging",
        umf_params=[35.0, 50.0, 60.0, 80.0],
        lmf_params=[45.0, 55.0, 55.0, 70.0],
        justification="Moderate working memory load (3-4 items). Code review, analytical writing, structured problem solving.",
    ),
    "Intense": IT2FuzzySet(
        name="Intense",
        umf_params=[60.0, 80.0, 100.0, 100.0],
        lmf_params=[75.0, 90.0, 100.0, 100.0],
        justification="High working memory load (5+ items, operating at capacity limit). System architecture design, complex mathematical proofs.",
    ),
}

# =====================================================================
# Output Consequents (Modeled as Type-1 Triangular Sets)
# =====================================================================
OUTPUT_SETS = {
    "Low": IT2FuzzySet(
        name="Low",
        umf_params=[0.0, 0.0, 0.0, 40.0],
        lmf_params=[0.0, 0.0, 0.0, 40.0],
        justification="Optimal mental capacity balance. User can handle complex or routine tasks effortlessly.",
    ),
    "Moderate": IT2FuzzySet(
        name="Moderate",
        umf_params=[30.0, 50.0, 50.0, 70.0],
        lmf_params=[30.0, 50.0, 50.0, 70.0],
        justification="Manageable cognitive workload requiring steady pacing to avoid onset of burnout.",
    ),
    "Critical": IT2FuzzySet(
        name="Critical",
        umf_params=[60.0, 100.0, 100.0, 100.0],
        lmf_params=[60.0, 100.0, 100.0, 100.0],
        justification="Severe cognitive strain threshold (> 65 score). Forces dynamic schedule reprioritization and task deferral.",
    ),
}
