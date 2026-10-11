# Product Requirements Document (PRD)
**Project:** Computing with Words (CWW) Behavioral Load Manager  
**Context:** Master of Science in Computer Science Thesis Project (Univ. of Neuchâtel) / LiveWell Ecosystem  
**Core Tech:** Interval Type-2 (IT2) Fuzzy Logic, Karnik-Mendel Type-Reduction, React (Next.js), Python (FastAPI, NumPy).

---

## 1. Objective
Build an end-to-end behavioral health and task scheduling web application. The system replaces rigid numerical user inputs (e.g., "Stress = 8/10") with subjective linguistic inputs (e.g., "Overwhelmed"). It utilizes an Interval Type-2 Fuzzy Inference System (IT2 FIS) to mathematically process the semantic uncertainty of these words (Footprint of Uncertainty - FOU) and outputs a crisp cognitive load score to dynamically reprioritize the user's task dashboard.

---

## 2. Core Features & User Flow
1. **Linguistic State Input (Web UI):** User selects their current behavioral state across 4 drivers: **Fatigue**, **Stress**, **Sleep Quality**, and **Task Complexity** via interactive cards/chips or optional continuous sliders.
2. **Data Transmission:** The React web client sends the selected linguistic terms (`fatigue_state`, `stress_state`, `sleep_state`, `task_complexity_state`) to the FastAPI backend.
3. **Fuzzy Inference Engine (Python):** 
   - Maps input terms to predefined IT2 Fuzzy Sets (Upper Membership Function [UMF] and Lower Membership Function [LMF]).
   - Evaluates the 9-rule IT2 rule base to compute rule firing intervals $[\underline{f}_r, \overline{f}_r]$.
   - Aggregates consequent Type-1 fuzzy sets weighted by firing intervals into an IT2 aggregated fuzzy set.
   - Executes the **Karnik-Mendel (KM)** iterative type-reduction algorithm to find left switch point $y_l$ and right switch point $y_r$, yielding centroid interval $[y_l, y_r]$.
   - Defuzzifies to crisp output $Y_{crisp} = \frac{y_l + y_r}{2}$.
4. **Dynamic Task Reprioritization (Web Dashboard):** The frontend receives the crisp cognitive load score (0–100) along with detailed FOU metrics, dynamically reprioritizing the Kanban-style task list (e.g., automatically deferring "High Load" / "Deep Work" tasks to tomorrow if cognitive load score $> 65$).
5. **Interactive IT2 FOU Visualization & Justification Inspector:** Interactive chart displaying membership functions, Footprint of Uncertainty (FOU), rule activation intervals, Karnik-Mendel switch points ($y_l, y_r$), and academic data/rule justifications.

---

## 3. Linguistic Dictionary, IT2 Set Definitions & Psychometric Data Justifications

Boundaries represent trapezoidal membership functions `[Lower Bound, Core Left, Core Right, Upper Bound]` on a 0–100 scale. The gap between UMF and LMF defines the Footprint of Uncertainty (FOU), modeling inter-individual linguistic uncertainty.

### Driver 1: Fatigue Level (Physical & Mental Exhaustion)
*Psychometric Grounding:* Mapped from the **Samn-Perelli 7-Point Fatigue Scale** and **Stanford Sleepiness Scale**.

| Linguistic Term | Upper Membership Function (UMF) | Lower Membership Function (LMF) | Academic & Data Justification |
| :--- | :--- | :--- | :--- |
| **Energized** | Trapezoidal `[0, 0, 30, 50]` | Trapezoidal `[0, 0, 20, 40]` | Corresponds to Samn-Perelli levels 1–2 (alert, active). The LMF core `[0, 20]` guarantees 1.0 membership for optimal vigor. UMF upper bound 50 captures subjects who feel fully functional despite minor fatigue. |
| **Drained** | Trapezoidal `[30, 45, 55, 70]` | Trapezoidal `[40, 50, 50, 60]` | Corresponds to Samn-Perelli levels 3–4 (okay, somewhat tired). Cognitive processing speed decelerates by 15–25%. LMF core `[50, 50]` centers on the scale midpoint. |
| **Exhausted** | Trapezoidal `[55, 75, 100, 100]` | Trapezoidal `[65, 85, 100, 100]` | Corresponds to Samn-Perelli levels 5–7 (extremely tired, impairment). Working memory capacity degrades exponentially beyond 75%. LMF core `[85, 100]` forces critical load classification. |

### Driver 2: Stress Level (Perceived Psychological Pressure)
*Psychometric Grounding:* Mapped from **Cohen's Perceived Stress Scale (PSS)** and the **Yerkes-Dodson Law of Arousal**.

| Linguistic Term | Upper Membership Function (UMF) | Lower Membership Function (LMF) | Academic & Data Justification |
| :--- | :--- | :--- | :--- |
| **Relaxed** | Trapezoidal `[0, 0, 35, 55]` | Trapezoidal `[0, 0, 25, 45]` | Reflects parasympathetic dominance. LMF core `[0, 25]` represents baseline calm. UMF extends to 55 to allow mild eustress (positive arousal) without triggering high stress. |
| **Pressured** | Trapezoidal `[35, 50, 60, 80]` | Trapezoidal `[45, 55, 55, 70]` | Represents the optimal performance zone under Yerkes-Dodson. UMF span `[35, 80]` captures the wide subjective range where users feel deadline urgency without emotional breakdown. |
| **Overwhelmed** | Trapezoidal `[60, 80, 100, 100]` | Trapezoidal `[75, 90, 100, 100]` | Acute distress where cortisol levels impair prefrontal cortex executive control. LMF core `[90, 100]` ensures immediate critical load assignment. |

### Driver 3: Sleep Quality (Restorative Sleep Deficit)
*Psychometric Grounding:* Mapped from the **Pittsburgh Sleep Quality Index (PSQI)** and Dawson & Reid circadian debt models.

| Linguistic Term | Upper Membership Function (UMF) | Lower Membership Function (LMF) | Academic & Data Justification |
| :--- | :--- | :--- | :--- |
| **Restful** | Trapezoidal `[0, 0, 30, 50]` | Trapezoidal `[0, 0, 20, 40]` | Full REM & slow-wave sleep recovery (PSQI < 5). Maximum synaptic homeostasis and memory consolidation. |
| **Restless** | Trapezoidal `[30, 45, 55, 70]` | Trapezoidal `[40, 50, 50, 60]` | Partial sleep fragmentation (PSQI 5–10). Attentional lapses increase by 30%. |
| **Deprived** | Trapezoidal `[55, 75, 100, 100]` | Trapezoidal `[65, 85, 100, 100]` | Severe sleep debt (> 24h wakefulness or PSQI > 10). Cognitive deficit is equivalent to 0.10% blood alcohol level (Dawson & Reid). |

### Driver 4: Task Complexity (External Mental Demand)
*Psychometric Grounding:* Mapped from the **NASA Task Load Index (NASA-TLX)** Mental Demand dimension and Cowan's Working Memory Capacity model.

| Linguistic Term | Upper Membership Function (UMF) | Lower Membership Function (LMF) | Academic & Data Justification |
| :--- | :--- | :--- | :--- |
| **Routine** | Trapezoidal `[0, 0, 35, 55]` | Trapezoidal `[0, 0, 25, 45]` | Minimal working memory load (1–2 items in Cowan's 4-chunk model). Admin, repetitive sorting, simple replies. |
| **Challenging** | Trapezoidal `[35, 50, 60, 80]` | Trapezoidal `[45, 55, 55, 70]` | Moderate working memory load (3–4 items). Code review, analytical writing, structured problem solving. |
| **Intense** | Trapezoidal `[60, 80, 100, 100]` | Trapezoidal `[75, 90, 100, 100]` | High working memory load (5+ items, operating at capacity limit). System architecture design, complex mathematical proofs. |

### Output: Cognitive Load Score (0 - 100)
Consequents are modeled as Type-1 triangular sets for crisp calculation over domain $x \in [0, 100]$:
- **Low Load:** Triangular `[0, 0, 0, 40]`
- **Moderate Load:** Triangular `[30, 50, 50, 70]`
- **Critical Load:** Triangular `[60, 100, 100, 100]`

---

## 4. Extended Fuzzy Rule Base & Detailed Rule Justifications

The Python engine implements the following 9 IT2 fuzzy rules with academic rationale for every rule:

1. **Rule 1:** `IF Fatigue is Energized AND Stress is Relaxed AND Sleep is Restful THEN Load is Low`  
   *Justification:* Physiological, emotional, and circadian drivers are all in homeostatic balance. Cognitive capacity is at 100%, resulting in minimal cognitive load (**Low Load**).

2. **Rule 2:** `IF Fatigue is Energized AND Stress is Pressured AND Task is Routine THEN Load is Moderate`  
   *Justification:* Vigor offsets deadline pressure when executing low-complexity tasks. Per Yerkes-Dodson law, mild arousal enhances throughput without causing cognitive overload (**Moderate Load**).

3. **Rule 3:** `IF Fatigue is Drained AND Stress is Relaxed AND Task is Routine THEN Load is Moderate`  
   *Justification:* Moderate fatigue reduces processing speed, but low stress and routine task demands prevent working memory bottlenecking (**Moderate Load**).

4. **Rule 4:** `IF Fatigue is Drained AND Stress is Pressured THEN Load is Critical`  
   *Justification:* Dual strain: physical tiredness combined with emotional pressure creates a compounding cognitive tax, straining prefrontal cortex resources (**Critical Load**).

5. **Rule 5:** `IF Fatigue is Exhausted OR Stress is Overwhelmed THEN Load is Critical`  
   *Justification:* Single-point failure rule. Severe exhaustion (Samn-Perelli > 5) or acute emotional distress independently incapacitates executive functioning, forcing an immediate **Critical Load** rating.

6. **Rule 6:** `IF Sleep is Deprived AND Task is Intense THEN Load is Critical`  
   *Justification:* Sleep deprivation severely impairs synaptic plasticity and attentional control (Dawson & Reid). Attempting complex tasks under severe sleep debt guarantees error escalation (**Critical Load**).

7. **Rule 7:** `IF Stress is Overwhelmed AND Task is Challenging THEN Load is Critical`  
   *Justification:* High stress induces attentional tunnel vision. Paired with a challenging task, total mental demand far exceeds available working memory chunks (**Critical Load**).

8. **Rule 8:** `IF Fatigue is Drained AND Sleep is Restless AND Task is Challenging THEN Load is Critical`  
   *Justification:* Chronic sub-threshold fatigue and fragmented sleep erode mental resilience. A challenging task tips total cognitive workload past the breakdown threshold (**Critical Load**).

9. **Rule 9:** `IF Fatigue is Energized AND Sleep is Restful AND Task is Intense THEN Load is Moderate`  
   *Justification:* High physiological energy and full sleep recovery provide maximum cognitive buffer, enabling the user to handle intense tasks without entering burnout territory (**Moderate Load**).

---

## 5. Success Criteria
- Python backend implements Karnik-Mendel iterative algorithm for IT2 type-reduction across all 4 drivers without using `scikit-fuzzy`.
- React frontend renders a responsive Kanban board with dynamic load reprioritization, real-time API integration, multi-driver controls, and comprehensive FOU & rule justification visualizer.
- Full test suite verifying KM type-reduction accuracy, multi-driver evaluations, and API data contracts.
