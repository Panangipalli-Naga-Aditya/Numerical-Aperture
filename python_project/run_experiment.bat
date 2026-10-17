@echo off
title Optical Fiber Numerical Aperture Lab
echo ========================================================
echo   NUMERICAL APERTURE - OPTICAL FIBER 3D EXPERIMENT
echo   B.Tech Physics Laboratory Suite
echo ========================================================
echo.

if not exist ".venv" (
    echo Creating Python virtual environment (.venv)...
    python -m venv .venv
    echo Installing dependencies...
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

echo Launching main laboratory application...
python main.py

pause
