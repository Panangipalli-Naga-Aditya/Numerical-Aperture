"""
graphs.py
=========
Scientific plotting module for the Optical Fiber Numerical Aperture experiment.

Plots:
    1. Spot Diameter D (mm) vs. Distance L (mm)
       - Demonstrates linear divergence of emerging light cone: slope = 2 * tan(theta)
    2. Numerical Aperture (NA) vs. Distance L (mm)
       - Demonstrates fundamental optical principle: NA is an intrinsic fiber constant
         independent of distance L.
"""

from typing import List, Dict, Optional, Tuple
import matplotlib
import matplotlib.pyplot as plt
import numpy as np


def configure_plot_style(dark_theme: bool = True):
    """Configures matplotlib styling for scientific laboratory presentation."""
    if dark_theme:
        plt.style.use("dark_background")
        matplotlib.rcParams["axes.facecolor"] = "#090d16"
        matplotlib.rcParams["figure.facecolor"] = "#0b1120"
        matplotlib.rcParams["text.color"] = "#e2e8f0"
        matplotlib.rcParams["axes.labelcolor"] = "#94a3b8"
        matplotlib.rcParams["xtick.color"] = "#94a3b8"
        matplotlib.rcParams["ytick.color"] = "#94a3b8"
        matplotlib.rcParams["grid.color"] = "#1e293b"
        matplotlib.rcParams["grid.alpha"] = 0.7
    else:
        plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")


def create_dual_experiment_plot(
    trials: List[Dict[str, float]],
    theoretical_na: float = 0.20,
    dark_theme: bool = True,
    save_path: Optional[str] = None
) -> Tuple[plt.Figure, Tuple[plt.Axes, plt.Axes]]:
    """
    Generates a high-quality 2-panel laboratory figure:
      Panel 1: Spot Diameter D vs Distance L
      Panel 2: Numerical Aperture NA vs Distance L

    Parameters:
        trials: List of trial dictionaries with 'L', 'D', 'NA'.
        theoretical_na: Expected NA (default 0.20).
        dark_theme: If True, uses the laboratory dark navy theme.
        save_path: Optional filename to save the generated plot.

    Returns:
        (fig, (ax1, ax2)): Matplotlib Figure and Axes tuple.
    """
    configure_plot_style(dark_theme)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5), dpi=100)
    fig.suptitle(
        "Optical Fiber Experiment: Numerical Aperture (NA) Analysis",
        fontsize=14,
        fontweight="bold",
        color="#38bdf8" if dark_theme else "#0369a1",
        y=0.98
    )

    # 1. Theoretical lines
    L_line = np.linspace(5.0, 70.0, 200)
    tan_theta = theoretical_na / np.sqrt(1.0 - (theoretical_na ** 2))
    D_theory_line = 2.0 * L_line * tan_theta

    # Extract trial points
    if trials:
        L_pts = [t["L"] for t in trials]
        D_pts = [t["D"] for t in trials]
        na_pts = [t["NA"] for t in trials]
    else:
        L_pts, D_pts, na_pts = [], [], []

    # ---------------- PANEL 1: D vs L ----------------
    ax1.plot(
        L_line,
        D_theory_line,
        color="#38bdf8",
        linestyle="--",
        linewidth=2,
        label=f"Theoretical Linear Cone (NA = {theoretical_na:.2f})"
    )
    if L_pts:
        ax1.scatter(
            L_pts,
            D_pts,
            color="#f43f5e",
            s=70,
            zorder=5,
            edgecolors="#ffffff",
            linewidths=1.2,
            label="Experimental / Simulated Trials"
        )
        # Annotate last point
        last_L, last_D = L_pts[-1], D_pts[-1]
        ax1.annotate(
            f"L={last_L:.1f} mm\nD={last_D:.2f} mm",
            xy=(last_L, last_D),
            xytext=(last_L + 3, last_D - 2),
            color="#fb7185",
            fontsize=9,
            arrowprops=dict(arrowstyle="->", color="#fb7185", lw=1.2)
        )

    ax1.set_title("1. Spot Diameter (D) vs. Distance (L)", fontsize=11, fontweight="bold", pad=10)
    ax1.set_xlabel("Distance between Fiber Tip & Screen, L (mm)", fontsize=10)
    ax1.set_ylabel("Average Spot Diameter, D (mm)", fontsize=10)
    ax1.set_xlim(0, max(75.0, max(L_pts) + 10 if L_pts else 75.0))
    ax1.set_ylim(0, max(35.0, max(D_pts) + 8 if D_pts else 35.0))
    ax1.grid(True, linestyle=":", alpha=0.6)
    ax1.legend(loc="upper left", framealpha=0.85, fontsize=8.5)

    # ---------------- PANEL 2: NA vs L ----------------
    ax2.axhline(
        y=theoretical_na,
        color="#10b981",
        linestyle="-",
        linewidth=2,
        label=f"Theoretical Invariant NA = {theoretical_na:.4f}"
    )
    if L_pts:
        ax2.scatter(
            L_pts,
            na_pts,
            color="#ec4899",
            s=70,
            zorder=5,
            edgecolors="#ffffff",
            linewidths=1.2,
            label="Calculated NA per Trial"
        )
        mean_na = np.mean(na_pts)
        ax2.axhline(
            y=mean_na,
            color="#f59e0b",
            linestyle=":",
            linewidth=1.5,
            label=f"Experimental Mean NA = {mean_na:.4f}"
        )

    ax2.set_title("2. Numerical Aperture (NA) Invariance vs. Distance (L)", fontsize=11, fontweight="bold", pad=10)
    ax2.set_xlabel("Distance between Fiber Tip & Screen, L (mm)", fontsize=10)
    ax2.set_ylabel("Numerical Aperture, NA (dimensionless)", fontsize=10)
    ax2.set_xlim(0, max(75.0, max(L_pts) + 10 if L_pts else 75.0))
    ax2.set_ylim(0.0, 0.40)
    ax2.grid(True, linestyle=":", alpha=0.6)
    ax2.legend(loc="lower right", framealpha=0.85, fontsize=8.5)

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, bbox_inches="tight", dpi=150)
        print(f"[GRAPH SAVED] Plot exported to: {save_path}")

    return fig, (ax1, ax2)


if __name__ == "__main__":
    from calculations import generate_distance_sweep
    print("Testing graphs.py module...")
    sample_trials = generate_distance_sweep(L_start=10.0, L_end=50.0, steps=5, na=0.20)
    fig, _ = create_dual_experiment_plot(sample_trials, theoretical_na=0.20, dark_theme=True)
    print("Successfully generated experimental verification plots!")
