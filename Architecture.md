# Architecture and Implementation Details

## 1. Technology Stack
- **Frontend:** React 18 / Next.js (App Router), Tailwind CSS, Lucide Icons, Recharts (for FOU & Rule Justification visualization).
- **Backend API:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn.
- **Mathematical Engine:** NumPy (pure mathematical matrix ops for membership functions, rule evaluation, and Karnik-Mendel algorithm).

---

## 2. Directory Structure
```text
/repo_root
  ├── PRD.md
  ├── Architecture.md
  ├── backend/
  │   ├── main.py                     # FastAPI routes & CORS setup
  │   ├── requirements.txt            # Python dependencies
  │   ├── tests/
  │   │   ├── test_it2_sets.py        # Unit tests for IT2 membership functions
  │   │   ├── test_karnik_mendel.py   # Tests for KM algorithm & switch points
  │   │   └── test_api.py             # Endpoint tests for /api/v1/evaluate_load
  │   └── fuzzy_engine/
  │       ├── __init__.py
  │       ├── it2_sets.py             # UMF/LMF trapezoidal & triangular functions (4 Drivers)
  │       ├── rules.py                # 9-Rule IT2 Rule base evaluation & interval firing
  │       └── karnik_mendel.py        # Karnik-Mendel algorithm implementation
  └── frontend/                       # Next.js Application
      ├── package.json
      ├── tailwind.config.js
      └── src/
          ├── app/
          │   ├── layout.tsx
          │   ├── page.tsx            # Main dashboard
          │   └── globals.css
          ├── components/
          │   ├── TaskBoard.tsx       # Kanban task list (Today vs Deferred)
          │   ├── StateSelectorModal.tsx # Multi-driver selector (Fatigue, Stress, Sleep, Task)
          │   ├── FOUVisualizer.tsx   # FOU membership & centroid chart with Rule Rationale Inspector
          │   └── Header.tsx
          └── utils/
              └── api.ts              # FastAPI client service
```

---

## 3. Data Contracts (API)

### Endpoint: `POST /api/v1/evaluate_load`

#### Request Payload (JSON):
```json
{
  "user_id": "u_12345",
  "fatigue_state": "Drained",
  "stress_state": "Pressured",
  "sleep_state": "Restless",
  "task_complexity_state": "Challenging"
}
```

#### Response Payload (JSON):
```json
{
  "cognitive_load_score": 82.4,
  "recommended_action": "defer_deep_work",
  "km_iterations_left": 2,
  "km_iterations_right": 2,
  "y_left": 78.2,
  "y_right": 86.6,
  "rule_firings": [
    {
      "rule_id": 4,
      "rule_text": "IF Fatigue is Drained AND Stress is Pressured THEN Load is Critical",
      "justification": "Dual strain: physical tiredness combined with emotional pressure creates a compounding cognitive tax.",
      "f_lower": 1.0,
      "f_upper": 1.0
    }
  ],
  "fou_curves": {
    "domain": [0, 1, 2, ..., 100],
    "aggregated_umf": [0.0, ..., 1.0],
    "aggregated_lmf": [0.0, ..., 1.0]
  }
}
```

---

## 4. Algorithmic Instructions for Karnik-Mendel (KM Algorithm)

The Karnik-Mendel algorithm computes the centroid interval $[y_l, y_r]$ of an activated IT2 fuzzy set defined on discrete domain points $x_1, x_2, \dots, x_N$ with upper bound $\overline{\mu}_i$ and lower bound $\underline{\mu}_i$.

### Step 1: Initialization
1. Sort domain values $x_1 < x_2 < \dots < x_N$.
2. Calculate initial weights $w_i = \frac{\overline{\mu}_i + \underline{\mu}_i}{2}$ for all $i = 1, \dots, N$.
3. Compute initial centroid:
   $$c = \frac{\sum_{i=1}^{N} x_i w_i}{\sum_{i=1}^{N} w_i}$$

### Step 2: Find Left Switch Point ($L$) & Calculate $y_l$
1. Find switch point index $k$ ($1 \le k \le N-1$) such that $x_k \le c \le x_{k+1}$.
2. Re-assign weights:
   $$w_i = \begin{cases} \overline{\mu}_i & \text{if } i \le k \\ \underline{\mu}_i & \text{if } i > k \end{cases}$$
3. Compute new centroid:
   $$c_{new} = \frac{\sum_{i=1}^{N} x_i w_i}{\sum_{i=1}^{N} w_i}$$
4. If $|c_{new} - c| < \epsilon$, stop and set $y_l = c_{new}$. Otherwise, set $c = c_{new}$ and repeat Step 2.

### Step 3: Find Right Switch Point ($R$) & Calculate $y_r$
1. Reset initial centroid $c$ using average weights (same as Step 1).
2. Find switch point index $k$ ($1 \le k \le N-1$) such that $x_k \le c \le x_{k+1}$.
3. Re-assign weights (inverse of Step 2):
   $$w_i = \begin{cases} \underline{\mu}_i & \text{if } i \le k \\ \overline{\mu}_i & \text{if } i > k \end{cases}$$
4. Compute new centroid:
   $$c_{new} = \frac{\sum_{i=1}^{N} x_i w_i}{\sum_{i=1}^{N} w_i}$$
5. If $|c_{new} - c| < \epsilon$, stop and set $y_r = c_{new}$. Otherwise, set $c = c_{new}$ and repeat Step 3.

### Step 4: Final Defuzzification
Return crisp output:
$$Y_{crisp} = \frac{y_l + y_r}{2}$$
Map $Y_{crisp} \in [0, 100]$ to `cognitive_load_score` in the API response.
