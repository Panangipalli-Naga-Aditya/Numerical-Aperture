"""
apparatus_3d.py
===============
3D Physics Laboratory Apparatus for Optical Fiber Numerical Aperture Experiment.
Modeled precisely from actual physical laboratory photographs:
- Dual chrome cylindrical optical rails with millimeter scale rule and arched foot supports.
- Standalone black laser power supply module box with red toggle switch on table.
- Left launcher upright with height adjustment rod and clamp lever.
- Black optical fiber patch cord looping across the bench.
- Fiber output chuck barrel pointing at target screen.
- Screen carriage with micrometer adjustment thumb screw.
- Vertical target screen with concentric circles (4, 8, 12, 16... up to 80 mm) and glowing red laser spot.
"""

import math
from typing import Optional, Tuple, Dict, Any
import numpy as np


class ApparatusGeometry:
    def __init__(self, L: float = 30.0, na: float = 0.20):
        self.L = float(L)
        self.na = float(na)
        self.update_dimensions(L, na)

    def update_dimensions(self, L: float, na: float):
        self.L = float(L)
        self.na = float(na)
        tan_theta = self.na / math.sqrt(max(0.001, 1.0 - (self.na ** 2)))
        # Acceptance angle: theta = arcsin(NA)
        self.theta_deg = math.degrees(math.asin(min(1.0, max(0.0, self.na))))
        self.spot_radius = self.L * tan_theta
        self.spot_diameter = 2.0 * self.spot_radius


def render_matplotlib_3d(
    ax: Any,
    L: float = 30.0,
    na: float = 0.20,
    azimuth: float = 35.0,
    elevation: float = 22.0
) -> None:
    """
    Renders 3D optical apparatus matching physical photos 1 and 2.
    """
    ax.clear()
    ax.set_facecolor("#070b14")

    geo = ApparatusGeometry(L, na)
    bench_y = -28.0

    # 1. Dual Chrome Steel Rails (Photo 1)
    bx = [-90, max(90, L + 30)]
    # Front rail
    ax.plot(bx, [12, 12], [bench_y, bench_y], color="#cbd5e1", lw=3.0)
    # Back rail
    ax.plot(bx, [-12, -12], [bench_y, bench_y], color="#cbd5e1", lw=3.0)
    # Center millimeter rule
    ax.plot(bx, [0, 0], [bench_y - 0.5, bench_y - 0.5], color="#94a3b8", lw=1.8)

    # 2. Black Arched End Supports with Leveling Screws (Photo 1)
    for x_end in [bx[0], bx[1]]:
        ax.plot([x_end, x_end], [-18, 18], [bench_y, bench_y], color="#18181b", lw=5.0)
        ax.plot([x_end, x_end], [-18, -18], [bench_y, bench_y - 8], color="#64748b", lw=2.5)
        ax.plot([x_end, x_end], [18, 18], [bench_y, bench_y - 8], color="#64748b", lw=2.5)

    # 3. Black Laser Power Supply Unit Box on Table with Red Switch (Photo 1)
    ax.plot([-30, -5, -5, -30, -30], [28, 28, 48, 48, 28], [-35, -35, -35, -35, -35], color="#1e293b", lw=2)
    ax.text(-17.5, 38, -34, "LASER SUPPLY", color="#94a3b8", fontsize=7, ha="center")
    # Red switch
    ax.scatter([-10], [38], [-34], color="#ef4444", s=30)

    # 4. Left Launcher Upright (Photo 1)
    ax.plot([-65, -65], [0, 0], [bench_y, 12], color="#cbd5e1", lw=3)
    ax.plot([-70, -60], [0, 0], [12, 12], color="#1e293b", lw=5)

    # 5. Flexible Black Optical Fiber looping across bench (Photo 1)
    t = np.linspace(0, 1, 40)
    fx = -60 + t * 60
    fy = 8 * np.sin(np.pi * t)
    fz = 12 - 24 * np.sin(np.pi * t)
    ax.plot(fx, fy, fz, color="#18181b", lw=2.5, label="Optical Fiber Cable")

    # 6. Right Fiber Output Chuck Upright (Photo 2)
    ax.plot([0, 0], [0, 0], [bench_y, 12], color="#cbd5e1", lw=3)
    ax.plot([0, 10], [0, 0], [12, 12], color="#18181b", lw=4.5)  # chuck barrel

    # 7. Emerging Conical Red Light Beam
    u = np.linspace(0, 1, 15)
    phi = np.linspace(0, 2 * np.pi, 25)
    U, P = np.meshgrid(u, phi)
    cx = 10 + U * (L - 10)
    cr = U * geo.spot_radius
    cy = cr * np.cos(P)
    cz = 12 + cr * np.sin(P)
    ax.plot_surface(cx, cy, cz, color="#ef4444", alpha=0.25, edgecolor="none")

    # 8. Movable Screen Carriage with Concentric Circles (Photo 2)
    ax.plot([L, L], [0, 0], [bench_y, 12], color="#cbd5e1", lw=3)
    # White screen plate
    sw, sh = 24, 30
    sy = np.array([-sw, sw, sw, -sw, -sw])
    sz = np.array([-sh + 12, -sh + 12, sh + 12, sh + 12, -sh + 12])
    sx = np.full_like(sy, L)
    ax.plot(sx, sy, sz, color="#ffffff", lw=2)

    # Concentric rings matching Photo 2: 4, 8, 12, 16...
    circle_phi = np.linspace(0, 2 * np.pi, 50)
    for r in [4, 8, 12, 16, 20]:
        if r < sw:
            ax.plot(np.full_like(circle_phi, L), r * np.cos(circle_phi), 12 + r * np.sin(circle_phi),
                    color="#64748b", lw=0.7, linestyle=":")

    # 9. Glowing Red Laser Spot on Screen (Photo 2)
    ax.plot(
        np.full_like(circle_phi, L + 0.1),
        geo.spot_radius * np.cos(circle_phi),
        12 + geo.spot_radius * np.sin(circle_phi),
        color="#ff0033",
        lw=2.5,
        label=f"Laser Spot (D={geo.spot_diameter:.2f} mm)"
    )

    # 10. Distance L Indicator
    ax.plot([10, L], [-22, -22], [bench_y + 4, bench_y + 4], color="#facc15", lw=1.8)
    ax.text((10 + L) / 2.0, -24, bench_y + 6, f"L = {L:.1f} mm", color="#fde047", fontsize=9, ha="center")

    ax.view_init(elev=elevation, azim=azimuth)
    ax.set_xlim(-80, max(85, L + 20))
    ax.set_ylim(-35, 55)
    ax.set_zlim(-40, 45)
    ax.set_axis_off()
    ax.set_title(
        f"3D Optical Apparatus (Photo 1 & 2 Model) | L={L:.1f} mm | Spot D={geo.spot_diameter:.2f} mm | θ={geo.theta_deg:.2f}°",
        fontsize=9,
        color="#38bdf8",
        pad=8
    )
