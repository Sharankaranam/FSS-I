import pytest
import numpy as np
from fuzzy_engine.it2_sets import (
    trapmf,
    IT2FuzzySet,
    FATIGUE_SETS,
    STRESS_SETS,
    SLEEP_SETS,
    TASK_COMPLEXITY_SETS,
    OUTPUT_SETS,
)


def test_trapmf_basic():
    x = np.array([0, 10, 20, 30, 40, 50, 60], dtype=float)
    res = trapmf(x, [0, 10, 30, 50])
    assert res[0] == 0.0
    assert res[1] == 1.0
    assert res[3] == 1.0
    assert res[4] == 0.5
    assert res[6] == 0.0


def test_it2_fuzzy_set_fou():
    domain = np.linspace(0, 100, 101)
    all_sets = {
        **FATIGUE_SETS,
        **STRESS_SETS,
        **SLEEP_SETS,
        **TASK_COMPLEXITY_SETS,
        **OUTPUT_SETS,
    }

    for name, fset in all_sets.items():
        umf, lmf = fset.evaluate_domain(domain)
        assert np.all(
            lmf <= umf + 1e-12
        ), f"Set {name} violated LMF <= UMF constraint"
        assert len(fset.justification) > 0, f"Set {name} missing justification"


def test_sleep_and_task_boundaries():
    deprived = SLEEP_SETS["Deprived"]
    u, l = deprived.evaluate_scalar(100.0)
    assert u == 1.0 and l == 1.0

    intense = TASK_COMPLEXITY_SETS["Intense"]
    u, l = intense.evaluate_scalar(100.0)
    assert u == 1.0 and l == 1.0
