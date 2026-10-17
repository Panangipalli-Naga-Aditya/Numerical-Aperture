# NUMERICAL APERTURE — OPTICAL FIBER LAB (3D Physical Experiment)

First-Year **B.Tech Engineering Physics Laboratory**:
**"Determination of Numerical Aperture (NA) and Acceptance Angle of an Optical Fiber"**.

This project provides:
- **3D Physical Apparatus**: Reconstructed directly from college laboratory photos:
  - Dual polished chrome rails on black cast-iron arched feet with leveling screws.
  - Centered millimeter graduated scale rule.
  - Black laser power supply module box with bright red toggle switch.
  - Left launcher upright with height adjustment rod and side lever clamp.
  - Slack flexible black optical fiber looping across the optical bench.
  - Right fiber output chuck barrel holding the fiber tip.
  - Movable target screen with calibrated concentric millimeter circles (4, 8, 12, 16... up to 80 mm) and glowing red laser spot.
- **Side-by-Side Hand-Gesture Camera**: Real-time webcam tracking (OpenCV & MediaPipe).
- **Physical Laboratory Measurement Calculator**: `real_measurement_calc.py` for logging physical lab trials ($L, D_1, D_2$) with mean NA and CSV export.
- **Scientific Formulas**:
  $$\text{NA} = \frac{D}{\sqrt{D^2 + 4L^2}}$$
  $$\theta = \sin^{-1}(\text{NA})$$

---

## Windows Quick Start (PowerShell)

```powershell
# 1. Create and activate virtual environment
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch the 3D Laboratory application
python main.py
```

### Physical Lab Measurements CLI Tool
```powershell
python real_measurement_calc.py
```
Or directly:
```powershell
python real_measurement_calc.py 30.0 12.2 12.4
```
Results are saved to `optical_fiber_lab_measurements.csv`.

---

## Mathematical Formulas

1. **Average Spot Diameter**:
   $$D = \frac{D_1 + D_2}{2}$$

2. **Numerical Aperture (NA)**:
   $$\text{NA} = \frac{D}{\sqrt{D^2 + 4L^2}}$$

3. **Acceptance Angle ($\theta$)**:
   $$\theta = \sin^{-1}(\text{NA}) \quad [\text{in degrees: } \theta = \arcsin(\text{NA}) \times (180^\circ / \pi)]$$
