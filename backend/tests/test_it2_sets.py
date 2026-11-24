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


def test_word_compatibility_self_and_neighbours():
    drained = FATIGUE_SETS["Drained"]
    # A word fully matches itself
    assert drained.compatibility(drained) == (1.0, 1.0)
    # ...and only partially fires a neighbour: lower 0, upper strictly between 0 and 1
    u, l = FATIGUE_SETS["Energized"].compatibility(drained)
    assert 0.0 < u < 1.0
    assert l == 0.0
    # Non-overlapping words do not fire at all
    assert FATIGUE_SETS["Exhausted"].compatibility(FATIGUE_SETS["Energized"]) == (0.0, 0.0)


def test_output_sets_have_a_footprint_of_uncertainty():
    domain = np.linspace(0, 100, 101)
    for name, fset in OUTPUT_SETS.items():
        umf, lmf = fset.evaluate_domain(domain)
        assert np.any(umf - lmf > 1e-6), f"Output set {name} has no FOU"
