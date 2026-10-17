"""
real_measurement_calc.py
=========================
Independent Physical Laboratory Calculator for Real Measured Values.
Acceptance Angle (theta) = arcsin(NA)
"""

import sys
import os
import csv
import math
from typing import List, Dict
from calculations import calculate_numerical_aperture


def evaluate_single_measurement(
    L: float,
    D1: float,
    D2: float,
    unit: str = "mm"
) -> Dict[str, float]:
    result = calculate_numerical_aperture(L, D1, D2)
    result["unit"] = unit
    return result


def display_results_card(res: Dict[str, float]) -> None:
    unit = res.get("unit", "mm")
    print("\n" + "=" * 55)
    print("      OPTICAL FIBER LAB: EXPERIMENTAL RESULTS CARD")
    print("=" * 55)
    print(f"  Screen Distance (L)         : {res['L']:>8.2f} {unit}")
    print(f"  Horizontal Diameter (D1)    : {res['D1']:>8.2f} {unit}")
    print(f"  Vertical Diameter (D2)      : {res['D2']:>8.2f} {unit}")
    print(f"  Average Spot Diameter (D)   : {res['D']:>8.2f} {unit}")
    print("-" * 55)
    print(f"  Numerical Aperture (NA)     : {res['NA']:>8.4f}")
    print(f"  Acceptance Angle (θ = sin⁻¹(NA)) : {res['theta_deg']:>8.2f}°")
    print("=" * 55 + "\n")


def save_trials_to_csv(
    trials: List[Dict[str, float]],
    filepath: str = "optical_fiber_lab_measurements.csv"
) -> None:
    headers = [
        "Trial", "Distance_L_mm", "Diameter_D1_mm", "Diameter_D2_mm",
        "Average_D_mm", "Numerical_Aperture_NA", "Acceptance_Angle_deg"
    ]
    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for idx, t in enumerate(trials, start=1):
            writer.writerow([
                idx,
                round(t["L"], 2),
                round(t["D1"], 2),
                round(t["D2"], 2),
                round(t["D"], 3),
                round(t["NA"], 4),
                round(t["theta_deg"], 2)
            ])
    print(f"[SUCCESS] Laboratory log saved to: {os.path.abspath(filepath)}")


def interactive_cli():
    print("*" * 65)
    print("    DETERMINATION OF NUMERICAL APERTURE (NA) OF OPTICAL FIBER")
    print("             REAL MEASUREMENTS LABORATORY CALCULATOR")
    print("*" * 65)
    print("Formula: NA = D / sqrt(D^2 + 4L^2) | theta = arcsin(NA)\n")

    trials: List[Dict[str, float]] = []
    trial_num = 1
    while True:
        print(f"--- Trial #{trial_num} ---")
        try:
            raw_L = input("Enter distance L from fiber tip to screen (mm) ['q' to quit]: ").strip()
            if raw_L.lower() == 'q':
                break
            L = float(raw_L)

            raw_D1 = input("Enter horizontal spot diameter D1 (mm): ").strip()
            if raw_D1.lower() == 'q':
                break
            D1 = float(raw_D1)

            raw_D2 = input("Enter vertical spot diameter D2 (mm): ").strip()
            if raw_D2.lower() == 'q':
                break
            D2 = float(raw_D2)

            res = evaluate_single_measurement(L, D1, D2)
            display_results_card(res)
            trials.append(res)
            trial_num += 1

            more = input("Record another trial? (y/n) [default: y]: ").strip().lower()
            if more == 'n':
                break
            print()

        except ValueError as e:
            print(f"[INPUT ERROR] {e}. Please enter positive numerical values.\n")

    if trials:
        print("\n" + "#" * 65)
        print("                      CONSOLIDATED REPORT")
        print("#" * 65)
        print(f"{'Trial':<6}{'L (mm)':<10}{'D1 (mm)':<10}{'D2 (mm)':<10}{'D (mm)':<10}{'NA':<10}{'θ (deg)':<10}")
        print("-" * 65)
        na_values = [t["NA"] for t in trials]
        for i, t in enumerate(trials, 1):
            print(f"{i:<6}{t['L']:<10.2f}{t['D1']:<10.2f}{t['D2']:<10.2f}{t['D']:<10.2f}{t['NA']:<10.4f}{t['theta_deg']:<10.2f}")

        mean_na = sum(na_values) / len(na_values)
        mean_theta = math.degrees(math.asin(min(1.0, mean_na)))
        print("-" * 65)
        print(f"Mean Numerical Aperture (NA)      : {mean_na:.4f}")
        print(f"Mean Acceptance Angle (θ = sin⁻¹(NA)) : {mean_theta:.2f}°")
        print("#" * 65)
        save_trials_to_csv(trials)


if __name__ == "__main__":
    if len(sys.argv) == 4:
        try:
            L_arg = float(sys.argv[1])
            D1_arg = float(sys.argv[2])
            D2_arg = float(sys.argv[3])
            res = evaluate_single_measurement(L_arg, D1_arg, D2_arg)
            display_results_card(res)
        except Exception as err:
            print(f"Error: {err}")
    else:
        interactive_cli()
