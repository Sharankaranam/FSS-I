import pytest
import numpy as np
from fuzzy_engine.karnik_mendel import karnik_mendel_type_reduction


def test_km_symmetric():
    # Symmetric triangular fuzzy set centered at 50
    x = np.linspace(0, 100, 101)
    umf = np.maximum(0.0, 1.0 - np.abs(x - 50.0) / 30.0)
    lmf = np.maximum(0.0, 1.0 - np.abs(x - 50.0) / 20.0)

    res = karnik_mendel_type_reduction(x, umf, lmf)
    assert abs(res["y_crisp"] - 50.0) < 0.5
    assert res["y_left"] <= res["y_right"]
    assert res["iterations_left"] > 0
    assert res["iterations_right"] > 0


def test_km_asymmetric_high_load():
    # Asymmetric set skewed towards right (high load ~85)
    x = np.linspace(0, 100, 101)
    umf = np.where(x >= 60, (x - 60) / 40.0, 0.0)
    lmf = np.where(x >= 70, (x - 70) / 30.0, 0.0)

    res = karnik_mendel_type_reduction(x, umf, lmf)
    assert res["y_crisp"] > 75.0
    assert res["y_left"] <= res["y_right"]


def test_km_zero_weights():
    x = np.linspace(0, 100, 101)
    umf = np.zeros_like(x)
    lmf = np.zeros_like(x)

    res = karnik_mendel_type_reduction(x, umf, lmf)
    assert res["y_crisp"] == 50.0
