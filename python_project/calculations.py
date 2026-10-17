"""
calculations.py
================
Scientific calculations and validation module for the Optical Fiber
Numerical Aperture (NA) experiment.

Formulas:
    Average Diameter:       D = (D1 + D2) / 2
    Numerical Aperture:     NA = D / sqrt(D^2 + 4 * L^2)
    Acceptance Half-Angle:  theta = arcsin(NA)  [in degrees: arcsin(NA) * 180 / pi]
    Simulated Diameter:     D = 2 * L * NA / sqrt(1 - NA^2)
"""

import math
from typing import Dict, List, Tuple, Optional


def calculate_spot_diameter_simulated(
    L: float,
    na: float = 0.20
) -> float:
    """
    Calculates the simulated output spot diameter D for a given
    fiber-to-screen distance L and fixed theoretical Numerical Aperture NA.

    Formula:
        D = 2 * L * NA / sqrt(1 - NA^2)
    """
    if L <= 0:
        raise ValueError(f"Distance L must be strictly positive (> 0), got {L}.")
    if not (0.0 < na < 1.0):
        raise ValueError(f"Numerical aperture must be strictly between 0 and 1, got {na}.")

    tan_theta = na / math.sqrt(1.0 - (na ** 2))
    diameter = 2.0 * L * tan_theta
    return diameter


def calculate_numerical_aperture(
    L: float,
    D1: float,
    D2: float
) -> Dict[str, float]:
    """
    Calculates the average spot diameter D, Numerical Aperture (NA),
    and Acceptance Angle (theta) where theta = arcsin(NA).

    Parameters:
        L (float): Distance from fiber tip to screen (mm).
        D1 (float): First measured spot diameter (mm).
        D2 (float): Second measured spot diameter (mm).

    Returns:
        dict:
            - L: Distance
            - D1: First diameter
            - D2: Second diameter
            - D: Average diameter = (D1 + D2) / 2
            - NA: Numerical aperture = D / sqrt(D^2 + 4 * L^2)
            - theta_rad: Acceptance angle = arcsin(NA) in radians
            - theta_deg: Acceptance angle = arcsin(NA) in degrees
    """
    if L <= 0:
        raise ValueError(f"Distance L must be strictly positive (> 0), got {L}.")
    if D1 <= 0 or D2 <= 0:
        raise ValueError(f"Spot diameters D1 and D2 must be strictly positive, got D1={D1}, D2={D2}.")

    D_avg = (D1 + D2) / 2.0
    denominator = math.sqrt((D_avg ** 2) + 4.0 * (L ** 2))
    na = D_avg / denominator

    # Acceptance angle: theta = arcsin(NA)
    clamped_na = min(1.0, max(0.0, na))
    theta_rad = math.asin(clamped_na)
    theta_deg = math.degrees(theta_rad)

    return {
        "L": float(L),
        "D1": float(D1),
        "D2": float(D2),
        "D": float(D_avg),
        "NA": float(na),
        "theta_rad": float(theta_rad),
        "theta_deg": float(theta_deg)
    }


def simulate_experiment_trial(
    L: float,
    na_target: float = 0.20,
    simulate_noise: bool = False,
    noise_percentage: float = 1.0
) -> Dict[str, float]:
    """
    Generates an idealized simulated trial where D1 = D2 = D.
    """
    D_ideal = calculate_spot_diameter_simulated(L, na=na_target)

    if simulate_noise:
        import random
        delta1 = (random.uniform(-1.0, 1.0) * (noise_percentage / 100.0)) * D_ideal
        delta2 = (random.uniform(-1.0, 1.0) * (noise_percentage / 100.0)) * D_ideal
        D1 = max(0.1, D_ideal + delta1)
        D2 = max(0.1, D_ideal + delta2)
    else:
        D1 = D_ideal
        D2 = D_ideal

    results = calculate_numerical_aperture(L, D1, D2)
    results["is_simulated"] = True
    results["theoretical_na"] = na_target
    return results


def generate_distance_sweep(
    L_start: float = 10.0,
    L_end: float = 60.0,
    steps: int = 6,
    na: float = 0.20
) -> List[Dict[str, float]]:
    """Generates trials across a range of distances L."""
    if steps < 2:
        steps = 2
    step_size = (L_end - L_start) / (steps - 1)
    dataset = []
    for i in range(steps):
        L_val = round(L_start + i * step_size, 2)
        dataset.append(simulate_experiment_trial(L_val, na_target=na, simulate_noise=False))
    return dataset


if __name__ == "__main__":
    print("Testing calculations module with theta = arcsin(NA)...")
    res = calculate_numerical_aperture(30.0, 12.247, 12.247)
    print(f"L = {res['L']} mm, D = {res['D']:.3f} mm")
    print(f"NA = {res['NA']:.4f}")
    print(f"Acceptance Angle theta = arcsin(NA) = {res['theta_deg']:.2f}°")
    expected_theta = math.degrees(math.asin(res['NA']))
    assert abs(res['theta_deg'] - expected_theta) < 1e-4
    print("Verification passed successfully!")
