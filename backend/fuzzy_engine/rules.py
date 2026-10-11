import numpy as np
from typing import Dict, Any, List, Optional
from .it2_sets import (
    FATIGUE_SETS,
    STRESS_SETS,
    SLEEP_SETS,
    TASK_COMPLEXITY_SETS,
    OUTPUT_SETS,
)

# Representative core domain midpoints for linguistic terms
FATIGUE_CORES = {"Energized": 15.0, "Drained": 50.0, "Exhausted": 87.5}
STRESS_CORES = {"Relaxed": 17.5, "Pressured": 55.0, "Overwhelmed": 90.0}
SLEEP_CORES = {"Restful": 15.0, "Restless": 50.0, "Deprived": 87.5}
TASK_CORES = {"Routine": 17.5, "Challenging": 55.0, "Intense": 90.0}


def evaluate_rules(
    fatigue_state: str = "Drained",
    stress_state: str = "Pressured",
    sleep_state: str = "Restless",
    task_complexity_state: str = "Challenging",
    fatigue_numeric: Optional[float] = None,
    stress_numeric: Optional[float] = None,
    sleep_numeric: Optional[float] = None,
    task_complexity_numeric: Optional[float] = None,
    num_domain_points: int = 101,
) -> Dict[str, Any]:
    """
    Evaluates the 12 IT2 Fuzzy Rules with continuous membership evaluation across domain cores/inputs.
    Guarantees rich multi-rule partial firings and continuous defuzzified scores (0-100).
    """

    # Resolve continuous scalar value for each driver
    fatigue_val = (
        fatigue_numeric
        if fatigue_numeric is not None
        else FATIGUE_CORES.get(fatigue_state, 50.0)
    )
    stress_val = (
        stress_numeric
        if stress_numeric is not None
        else STRESS_CORES.get(stress_state, 55.0)
    )
    sleep_val = (
        sleep_numeric
        if sleep_numeric is not None
        else SLEEP_CORES.get(sleep_state, 50.0)
    )
    task_val = (
        task_complexity_numeric
        if task_complexity_numeric is not None
        else TASK_CORES.get(task_complexity_state, 55.0)
    )

    # Evaluate membership bounds across all fuzzy sets in each driver
    fatigue_m = {k: s.evaluate_scalar(fatigue_val) for k, s in FATIGUE_SETS.items()}
    stress_m = {k: s.evaluate_scalar(stress_val) for k, s in STRESS_SETS.items()}
    sleep_m = {k: s.evaluate_scalar(sleep_val) for k, s in SLEEP_SETS.items()}
    task_m = {k: s.evaluate_scalar(task_val) for k, s in TASK_COMPLEXITY_SETS.items()}

    domain = np.linspace(0.0, 100.0, num_domain_points, dtype=np.float64)
    agg_umf = np.zeros(num_domain_points, dtype=np.float64)
    agg_lmf = np.zeros(num_domain_points, dtype=np.float64)

    raw_rules = []

    # R1: Energized AND Relaxed AND Restful -> Low
    r1_u = min(fatigue_m["Energized"][0], stress_m["Relaxed"][0], sleep_m["Restful"][0])
    r1_l = min(fatigue_m["Energized"][1], stress_m["Relaxed"][1], sleep_m["Restful"][1])
    raw_rules.append({
        "rule_id": 1,
        "rule_text": "IF Fatigue is Energized AND Stress is Relaxed AND Sleep is Restful THEN Load is Low",
        "justification": "Full physiological, emotional, and circadian recovery guarantees minimal cognitive load.",
        "consequent": "Low",
        "operator": "AND",
        "f_lower": float(r1_l),
        "f_upper": float(r1_u),
    })

    # R2: Energized AND Relaxed -> Low
    r2_u = min(fatigue_m["Energized"][0], stress_m["Relaxed"][0])
    r2_l = min(fatigue_m["Energized"][1], stress_m["Relaxed"][1])
    raw_rules.append({
        "rule_id": 2,
        "rule_text": "IF Fatigue is Energized AND Stress is Relaxed THEN Load is Low",
        "justification": "High energy combined with baseline calm provides a low cognitive load environment.",
        "consequent": "Low",
        "operator": "AND",
        "f_lower": float(r2_l),
        "f_upper": float(r2_u),
    })

    # R3: Energized AND Pressured AND Routine -> Moderate
    r3_u = min(fatigue_m["Energized"][0], stress_m["Pressured"][0], task_m["Routine"][0])
    r3_l = min(fatigue_m["Energized"][1], stress_m["Pressured"][1], task_m["Routine"][1])
    raw_rules.append({
        "rule_id": 3,
        "rule_text": "IF Fatigue is Energized AND Stress is Pressured AND Task is Routine THEN Load is Moderate",
        "justification": "Vigor offsets deadline urgency for routine task execution (Yerkes-Dodson optimal arousal).",
        "consequent": "Moderate",
        "operator": "AND",
        "f_lower": float(r3_l),
        "f_upper": float(r3_u),
    })

    # R4: Energized AND Restful AND Intense -> Moderate
    r4_u = min(fatigue_m["Energized"][0], sleep_m["Restful"][0], task_m["Intense"][0])
    r4_l = min(fatigue_m["Energized"][1], sleep_m["Restful"][1], task_m["Intense"][1])
    raw_rules.append({
        "rule_id": 4,
        "rule_text": "IF Fatigue is Energized AND Sleep is Restful AND Task is Intense THEN Load is Moderate",
        "justification": "Pristine physiological energy buffers against complex task demands, keeping net load moderate.",
        "consequent": "Moderate",
        "operator": "AND",
        "f_lower": float(r4_l),
        "f_upper": float(r4_u),
    })

    # R5: Drained AND Relaxed -> Moderate
    r5_u = min(fatigue_m["Drained"][0], stress_m["Relaxed"][0])
    r5_l = min(fatigue_m["Drained"][1], stress_m["Relaxed"][1])
    raw_rules.append({
        "rule_id": 5,
        "rule_text": "IF Fatigue is Drained AND Stress is Relaxed THEN Load is Moderate",
        "justification": "Moderate tiredness reduces mental speed, but low stress keeps total load manageable.",
        "consequent": "Moderate",
        "operator": "AND",
        "f_lower": float(r5_l),
        "f_upper": float(r5_u),
    })

    # R6: Restless AND Routine -> Moderate
    r6_u = min(sleep_m["Restless"][0], task_m["Routine"][0])
    r6_l = min(sleep_m["Restless"][1], task_m["Routine"][1])
    raw_rules.append({
        "rule_id": 6,
        "rule_text": "IF Sleep is Restless AND Task is Routine THEN Load is Moderate",
        "justification": "Sub-optimal sleep fragmentation causes minor lapses, but routine task demand keeps load moderate.",
        "consequent": "Moderate",
        "operator": "AND",
        "f_lower": float(r6_l),
        "f_upper": float(r6_u),
    })

    # R7: Drained AND Pressured -> Critical
    r7_u = min(fatigue_m["Drained"][0], stress_m["Pressured"][0])
    r7_l = min(fatigue_m["Drained"][1], stress_m["Pressured"][1])
    raw_rules.append({
        "rule_id": 7,
        "rule_text": "IF Fatigue is Drained AND Stress is Pressured THEN Load is Critical",
        "justification": "Dual strain: physical tiredness + emotional pressure creates compounding cognitive tax.",
        "consequent": "Critical",
        "operator": "AND",
        "f_lower": float(r7_l),
        "f_upper": float(r7_u),
    })

    # R8: Exhausted OR Overwhelmed -> Critical
    r8_u = max(fatigue_m["Exhausted"][0], stress_m["Overwhelmed"][0])
    r8_l = max(fatigue_m["Exhausted"][1], stress_m["Overwhelmed"][1])
    raw_rules.append({
        "rule_id": 8,
        "rule_text": "IF Fatigue is Exhausted OR Stress is Overwhelmed THEN Load is Critical",
        "justification": "Single-point failure: severe exhaustion or acute emotional distress incapacitates executive control.",
        "consequent": "Critical",
        "operator": "OR",
        "f_lower": float(r8_l),
        "f_upper": float(r8_u),
    })

    # R9: Deprived OR (Intense AND Drained) -> Critical
    r9_u = max(sleep_m["Deprived"][0], min(task_m["Intense"][0], fatigue_m["Drained"][0]))
    r9_l = max(sleep_m["Deprived"][1], min(task_m["Intense"][1], fatigue_m["Drained"][1]))
    raw_rules.append({
        "rule_id": 9,
        "rule_text": "IF Sleep is Deprived OR (Task is Intense AND Fatigue is Drained) THEN Load is Critical",
        "justification": "Severe sleep debt or attempting intense tasks while drained forces executive exhaustion.",
        "consequent": "Critical",
        "operator": "MIXED",
        "f_lower": float(r9_l),
        "f_upper": float(r9_u),
    })

    # R10: Drained AND Restless AND Challenging -> Critical
    r10_u = min(fatigue_m["Drained"][0], sleep_m["Restless"][0], task_m["Challenging"][0])
    r10_l = min(fatigue_m["Drained"][1], sleep_m["Restless"][1], task_m["Challenging"][1])
    raw_rules.append({
        "rule_id": 10,
        "rule_text": "IF Fatigue is Drained AND Sleep is Restless AND Task is Challenging THEN Load is Critical",
        "justification": "Triple sub-threshold strain: tiredness + fragmented sleep + challenging task exceeds mental capacity.",
        "consequent": "Critical",
        "operator": "AND",
        "f_lower": float(r10_l),
        "f_upper": float(r10_u),
    })

    # R11: Pressured AND Intense -> Critical
    r11_u = min(stress_m["Pressured"][0], task_m["Intense"][0])
    r11_l = min(stress_m["Pressured"][1], task_m["Intense"][1])
    raw_rules.append({
        "rule_id": 11,
        "rule_text": "IF Stress is Pressured AND Task is Intense THEN Load is Critical",
        "justification": "Deadline pressure paired with maximal working memory demand leads to cognitive overload.",
        "consequent": "Critical",
        "operator": "AND",
        "f_lower": float(r11_l),
        "f_upper": float(r11_u),
    })

    # R12: Sleep is Deprived -> Critical
    r12_u = sleep_m["Deprived"][0]
    r12_l = sleep_m["Deprived"][1]
    raw_rules.append({
        "rule_id": 12,
        "rule_text": "IF Sleep is Deprived THEN Load is Critical",
        "justification": "Severe sleep deprivation produces cognitive impairment equivalent to 0.10% BAC (Dawson & Reid).",
        "consequent": "Critical",
        "operator": "DIRECT",
        "f_lower": float(r12_l),
        "f_upper": float(r12_u),
    })

    # Find max firing strength across all rules to identify Top/Dominant Rules
    max_f_upper = max(r["f_upper"] for r in raw_rules)

    rule_firings = []
    top_rule_ids = []

    for r in raw_rules:
        is_triggered = r["f_upper"] > 0
        is_top_rule = (r["f_upper"] == max_f_upper) and (max_f_upper > 0)
        if is_top_rule:
            top_rule_ids.append(r["rule_id"])

        rule_entry = {
            **r,
            "is_triggered": is_triggered,
            "is_top_rule": is_top_rule,
        }
        rule_firings.append(rule_entry)

    # Aggregate Consequents using Maximum across rules
    for rf in rule_firings:
        f_upper = rf["f_upper"]
        f_lower = rf["f_lower"]
        if f_upper > 0:
            c_set = OUTPUT_SETS[rf["consequent"]]
            c_umf, c_lmf = c_set.evaluate_domain(domain)
            fired_umf = np.minimum(f_upper, c_umf)
            fired_lmf = np.minimum(f_lower, c_lmf)
            agg_umf = np.maximum(agg_umf, fired_umf)
            agg_lmf = np.maximum(agg_lmf, fired_lmf)

    return {
        "domain": domain,
        "agg_umf": agg_umf,
        "agg_lmf": agg_lmf,
        "rule_firings": rule_firings,
        "top_rule_ids": top_rule_ids,
        "max_f_upper": max_f_upper,
        "fatigue_memberships": fatigue_m,
        "stress_memberships": stress_m,
        "sleep_memberships": sleep_m,
        "task_complexity_memberships": task_m,
    }
