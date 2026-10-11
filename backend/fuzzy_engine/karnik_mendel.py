import numpy as np
from typing import Dict, Any, Tuple


def karnik_mendel_type_reduction(
    x: np.ndarray,
    umf: np.ndarray,
    lmf: np.ndarray,
    tol: float = 1e-6,
    max_iter: int = 100,
) -> Dict[str, Any]:
    """
    Executes the Karnik-Mendel (KM) algorithm for IT2 Type-Reduction.

    Given discrete domain x (sorted ascending), Upper Membership Function (umf),
    and Lower Membership Function (lmf):

    Step 1: Initialization with average weights w_i = (umf_i + lmf_i) / 2
    Step 2: Find Left Switch Point (L) & Calculate y_l
    Step 3: Find Right Switch Point (R) & Calculate y_r
    Step 4: Final Defuzzification Y_crisp = (y_l + y_r) / 2

    Returns a dictionary containing:
        - y_left: Left switch centroid y_l
        - y_right: Right switch centroid y_r
        - y_crisp: Final crisp defuzzified value Y_crisp
        - k_left: Left switch index k_l
        - k_right: Right switch index k_r
        - iterations_left: Number of KM iterations for left centroid
        - iterations_right: Number of KM iterations for right centroid
    """
    x = np.asarray(x, dtype=np.float64)
    umf = np.asarray(umf, dtype=np.float64)
    lmf = np.asarray(lmf, dtype=np.float64)

    # Ensure domain is sorted
    sort_idx = np.argsort(x)
    x = x[sort_idx]
    umf = umf[sort_idx]
    lmf = lmf[sort_idx]

    N = len(x)
    if N == 0:
        return {
            "y_left": 0.0,
            "y_right": 0.0,
            "y_crisp": 0.0,
            "k_left": 0,
            "k_right": 0,
            "iterations_left": 0,
            "iterations_right": 0,
        }

    # Handle all-zero membership edge case
    w_avg = (umf + lmf) / 2.0
    sum_w_avg = np.sum(w_avg)
    if sum_w_avg < 1e-12:
        default_val = float(np.mean(x))
        return {
            "y_left": default_val,
            "y_right": default_val,
            "y_crisp": default_val,
            "k_left": 0,
            "k_right": 0,
            "iterations_left": 0,
            "iterations_right": 0,
        }

    # =========================================================================
    # Step 1: Initial Centroid
    # =========================================================================
    c_init = float(np.sum(x * w_avg) / sum_w_avg)

    # =========================================================================
    # Step 2: Find Left Switch Point (L) & Calculate y_l
    # =========================================================================
    c = c_init
    y_l = c
    iter_l = 0
    k_l = 0

    for it in range(max_iter):
        iter_l += 1
        # Find switch point k such that x[k] <= c <= x[k+1]
        k = int(np.searchsorted(x, c, side="right") - 1)
        k = max(0, min(N - 2, k))

        # Re-assign weights:
        # If i <= k, set w_i = umf_i
        # If i > k, set w_i = lmf_i
        w = np.zeros(N, dtype=np.float64)
        w[: k + 1] = umf[: k + 1]
        w[k + 1 :] = lmf[k + 1 :]

        sum_w = np.sum(w)
        if sum_w < 1e-12:
            c_new = c
        else:
            c_new = float(np.sum(x * w) / sum_w)

        if abs(c_new - c) <= tol:
            y_l = c_new
            k_l = k
            break

        c = c_new
        y_l = c_new
        k_l = k

    # =========================================================================
    # Step 3: Find Right Switch Point (R) & Calculate y_r
    # =========================================================================
    c = c_init
    y_r = c
    iter_r = 0
    k_r = 0

    for it in range(max_iter):
        iter_r += 1
        # Find switch point k such that x[k] <= c <= x[k+1]
        k = int(np.searchsorted(x, c, side="right") - 1)
        k = max(0, min(N - 2, k))

        # Re-assign weights (INVERSE of Step 2):
        # If i <= k, set w_i = lmf_i
        # If i > k, set w_i = umf_i
        w = np.zeros(N, dtype=np.float64)
        w[: k + 1] = lmf[: k + 1]
        w[k + 1 :] = umf[k + 1 :]

        sum_w = np.sum(w)
        if sum_w < 1e-12:
            c_new = c
        else:
            c_new = float(np.sum(x * w) / sum_w)

        if abs(c_new - c) <= tol:
            y_r = c_new
            k_r = k
            break

        c = c_new
        y_r = c_new
        k_r = k

    # =========================================================================
    # Step 4: Final Defuzzification
    # =========================================================================
    y_crisp = (y_l + y_r) / 2.0

    return {
        "y_left": round(float(y_l), 4),
        "y_right": round(float(y_r), 4),
        "y_crisp": round(float(y_crisp), 4),
        "k_left": int(k_l),
        "k_right": int(k_r),
        "iterations_left": iter_l,
        "iterations_right": iter_r,
    }
