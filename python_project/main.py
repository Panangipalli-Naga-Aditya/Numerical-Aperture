"""
main.py
=======
NUMERICAL APERTURE — OPTICAL FIBER LAB
First-Year B.Tech Physics Laboratory Experiment

3D Interactive Laboratory Apparatus modeled from actual laboratory bench photos.
Formulas:
    Average Diameter:       D = (D1 + D2) / 2
    Numerical Aperture:     NA = D / sqrt(D^2 + 4 * L^2)
    Acceptance Angle:       θ = arcsin(NA)
"""

import sys
import os
import math
from typing import List, Dict, Optional

try:
    import tkinter as tk
    from tkinter import ttk, messagebox, filedialog
except ImportError:
    tk = None

try:
    import matplotlib
    matplotlib.use("TkAgg")
    import matplotlib.pyplot as plt
    from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
except ImportError:
    plt = None

import numpy as np

from calculations import (
    calculate_spot_diameter_simulated,
    calculate_numerical_aperture,
    simulate_experiment_trial
)
from apparatus_3d import render_matplotlib_3d, ApparatusGeometry
from graphs import create_dual_experiment_plot


class OpticalFiberLabApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("NUMERICAL APERTURE — OPTICAL FIBER LAB | 3D Physical Model")
        self.root.geometry("1300x820")
        self.root.minsize(1050, 680)
        self.root.configure(bg="#050811")

        self.current_L: float = 30.0
        self.theoretical_na: float = 0.20
        self.view_azim: float = 35.0
        self.view_elev: float = 22.0
        self.trials_history: List[Dict[str, float]] = []

        self._record_simulated_trial(self.current_L)

        self._setup_styles()
        self._build_top_header()
        self._build_main_layout()
        self._update_all_displays()

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(".", background="#0b1120", foreground="#e2e8f0", font=("Segoe UI", 9))
        style.configure("TFrame", background="#0b1120")
        style.configure("TNotebook", background="#050811", borderwidth=0)
        style.configure("TNotebook.Tab", background="#1e293b", foreground="#94a3b8", padding=[14, 6], font=("Segoe UI", 9, "bold"))
        style.map("TNotebook.Tab", background=[("selected", "#0284c7")], foreground=[("selected", "#ffffff")])

    def _build_top_header(self):
        header_frame = tk.Frame(self.root, bg="#070c18", height=60, padx=20, pady=8)
        header_frame.pack(side=tk.TOP, fill=tk.X)

        title_box = tk.Frame(header_frame, bg="#070c18")
        title_box.pack(side=tk.LEFT)

        tk.Label(
            title_box,
            text="NUMERICAL APERTURE — OPTICAL FIBER LAB",
            font=("Segoe UI", 14, "bold"),
            fg="#38bdf8",
            bg="#070c18"
        ).pack(anchor="w")

        tk.Label(
            title_box,
            text="Physical Apparatus Model • Formula: θ = sin⁻¹(NA) • Interactive 3D Physics Simulation",
            font=("Segoe UI", 8),
            fg="#94a3b8",
            bg="#070c18"
        ).pack(anchor="w")

        top_ctrl = tk.Frame(header_frame, bg="#070c18")
        top_ctrl.pack(side=tk.RIGHT)

        tk.Label(
            top_ctrl,
            text="Mouse Controls: Click & Drag to Orbit 3D Apparatus",
            font=("Segoe UI", 9, "bold"),
            fg="#38bdf8",
            bg="#0f172a",
            padx=12,
            pady=5,
            relief="groove"
        ).pack(side=tk.LEFT, padx=4)

    def _build_main_layout(self):
        main_paned = tk.PanedWindow(self.root, orient=tk.HORIZONTAL, bg="#050811", bd=0)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        # Left Sidebar (Controls & Results)
        sidebar = tk.Frame(main_paned, bg="#0b1120", width=360, padx=12, pady=10)
        sidebar.pack_propagate(False)
        main_paned.add(sidebar, minsize=320)

        self._build_input_panel(sidebar)
        self._build_results_panel(sidebar)
        self._build_trials_panel(sidebar)

        # Right Area: 3D model
        vis_container = tk.Frame(main_paned, bg="#070b14")
        main_paned.add(vis_container, minsize=700)

        # 3D View Toolbar
        tb = tk.Frame(vis_container, bg="#070b14", pady=4)
        tb.pack(fill=tk.X)
        tk.Label(tb, text="Views:", font=("Segoe UI", 8, "bold"), fg="#94a3b8", bg="#070b14").pack(side=tk.LEFT, padx=6)
        for name, az, el in [
            ("3D Perspective", 35.0, 22.0),
            ("Screen Rings (Photo 2)", 0.0, 0.0),
            ("Bench Side (Photo 1)", 90.0, 0.0),
            ("Overhead", 90.0, 89.9)
        ]:
            tk.Button(
                tb, text=name, font=("Segoe UI", 8), bg="#1e293b", fg="#38bdf8", relief="flat", padx=6, pady=2,
                cursor="hand2", command=lambda a=az, e=el: self._set_camera_angles(a, e)
            ).pack(side=tk.LEFT, padx=2)

        # 3D Matplotlib Canvas
        self.fig_3d = plt.figure(figsize=(7, 5), facecolor="#070b14")
        self.ax_3d = self.fig_3d.add_subplot(111, projection="3d")
        self.canvas_3d = FigureCanvasTkAgg(self.fig_3d, master=vis_container)
        self.canvas_3d_widget = self.canvas_3d.get_tk_widget()
        self.canvas_3d_widget.pack(fill=tk.BOTH, expand=True)

        self._last_mouse_x = 0
        self._last_mouse_y = 0
        self.canvas_3d_widget.bind("<ButtonPress-1>", self._on_mouse_down)
        self.canvas_3d_widget.bind("<B1-Motion>", self._on_mouse_drag)

    def _build_input_panel(self, parent: tk.Frame):
        p = tk.LabelFrame(parent, text=" ⚙ EXPERIMENTAL INPUT (DISTANCE L) ", font=("Segoe UI", 8, "bold"), fg="#38bdf8", bg="#0f172a", padx=10, pady=8)
        p.pack(fill=tk.X, pady=(0, 10))

        row1 = tk.Frame(p, bg="#0f172a")
        row1.pack(fill=tk.X, pady=2)
        tk.Label(row1, text="Distance (L):", font=("Segoe UI", 9, "bold"), fg="#e2e8f0", bg="#0f172a").pack(side=tk.LEFT)
        self.lbl_L_val = tk.Label(row1, text=f"{self.current_L:.1f} mm", font=("Consolas", 11, "bold"), fg="#facc15", bg="#0f172a")
        self.lbl_L_val.pack(side=tk.RIGHT)

        self.scale_L = ttk.Scale(p, from_=10.0, to=60.0, orient=tk.HORIZONTAL, value=self.current_L, command=self._on_slider_change)
        self.scale_L.pack(fill=tk.X, pady=4)

        btn_box = tk.Frame(p, bg="#0f172a")
        btn_box.pack(fill=tk.X, pady=(6, 2))
        tk.Button(btn_box, text="⚡ Log Trial", font=("Segoe UI", 9, "bold"), bg="#0284c7", fg="#ffffff", relief="flat", padx=8, pady=4, cursor="hand2", command=self._on_calculate_pressed).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 4))
        tk.Button(btn_box, text="↺ Reset", font=("Segoe UI", 9), bg="#334155", fg="#e2e8f0", relief="flat", padx=8, pady=4, cursor="hand2", command=self._on_reset_pressed).pack(side=tk.RIGHT)

    def _build_results_panel(self, parent: tk.Frame):
        self.card_panel = tk.LabelFrame(parent, text=" 📊 RESULTS [θ = sin⁻¹(NA)] ", font=("Segoe UI", 8, "bold"), fg="#38bdf8", bg="#0f172a", padx=10, pady=8)
        self.card_panel.pack(fill=tk.X, pady=(0, 10))

        self.res_labels: Dict[str, tk.Label] = {}
        fields = [
            ("Distance L", "res_L"),
            ("Average Diam D", "res_D"),
            ("Numerical Aperture (NA)", "res_NA"),
            ("Acceptance Angle (θ)", "res_theta")
        ]
        for label_text, key in fields:
            row = tk.Frame(self.card_panel, bg="#0f172a")
            row.pack(fill=tk.X, pady=2)
            tk.Label(row, text=f"{label_text}:", font=("Segoe UI", 8), fg="#94a3b8", bg="#0f172a").pack(side=tk.LEFT)
            val_lbl = tk.Label(row, text="--", font=("Consolas", 9, "bold"), fg="#38bdf8", bg="#0f172a")
            val_lbl.pack(side=tk.RIGHT)
            self.res_labels[key] = val_lbl

    def _build_trials_panel(self, parent: tk.Frame):
        frame = tk.LabelFrame(parent, text=" 📋 RECORDED TRIALS ", font=("Segoe UI", 8, "bold"), fg="#38bdf8", bg="#0f172a", padx=6, pady=6)
        frame.pack(fill=tk.BOTH, expand=True)

        cols = ("#", "L (mm)", "D (mm)", "NA", "θ (°)")
        self.tree_trials = ttk.Treeview(frame, columns=cols, show="headings", height=6)
        for c in cols:
            self.tree_trials.heading(c, text=c)
            self.tree_trials.column(c, width=48, anchor="center")
        self.tree_trials.pack(fill=tk.BOTH, expand=True)

    def _on_slider_change(self, val_str: str):
        new_L = round(float(val_str), 1)
        if abs(new_L - self.current_L) >= 0.1:
            self.current_L = new_L
            self.lbl_L_val.config(text=f"{self.current_L:.1f} mm")
            self._update_all_displays()

    def _on_calculate_pressed(self):
        self._record_simulated_trial(self.current_L)
        self._update_all_displays()

    def _on_reset_pressed(self):
        self.trials_history.clear()
        self.current_L = 30.0
        self.scale_L.set(30.0)
        self.lbl_L_val.config(text="30.0 mm")
        self._record_simulated_trial(30.0)
        self._update_all_displays()

    def _record_simulated_trial(self, L: float):
        self.trials_history.append(simulate_experiment_trial(L, na_target=self.theoretical_na))

    def _update_all_displays(self):
        D_sim = calculate_spot_diameter_simulated(self.current_L, self.theoretical_na)
        res = calculate_numerical_aperture(self.current_L, D_sim, D_sim)

        self.res_labels["res_L"].config(text=f"{res['L']:.2f} mm")
        self.res_labels["res_D"].config(text=f"{res['D']:.2f} mm*")
        self.res_labels["res_NA"].config(text=f"{res['NA']:.4f}*")
        self.res_labels["res_theta"].config(text=f"{res['theta_deg']:.2f}°*")

        render_matplotlib_3d(self.ax_3d, L=self.current_L, na=self.theoretical_na, azimuth=self.view_azim, elevation=self.view_elev)
        self.canvas_3d.draw_idle()

        for item in self.tree_trials.get_children():
            self.tree_trials.delete(item)
        for i, t in enumerate(self.trials_history, 1):
            self.tree_trials.insert("", tk.END, values=(i, f"{t['L']:.1f}", f"{t['D']:.2f}", f"{t['NA']:.4f}", f"{t['theta_deg']:.1f}°"))

    def _set_camera_angles(self, azim: float, elev: float):
        self.view_azim = azim
        self.view_elev = elev
        self.ax_3d.view_init(elev=self.view_elev, azim=self.view_azim)
        self.canvas_3d.draw_idle()

    def _on_mouse_down(self, event):
        self._last_mouse_x = event.x
        self._last_mouse_y = event.y

    def _on_mouse_drag(self, event):
        dx = event.x - self._last_mouse_x
        dy = event.y - self._last_mouse_y
        self._last_mouse_x = event.x
        self._last_mouse_y = event.y
        self.view_azim = (self.view_azim - dx * 0.5) % 360.0
        self.view_elev = np.clip(self.view_elev + dy * 0.5, -85.0, 85.0)
        self.ax_3d.view_init(elev=self.view_elev, azim=self.view_azim)
        self.canvas_3d.draw_idle()


def main():
    if tk is None:
        print("[CRITICAL] Tkinter is required for GUI.")
        sys.exit(1)
    root = tk.Tk()
    app = OpticalFiberLabApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
