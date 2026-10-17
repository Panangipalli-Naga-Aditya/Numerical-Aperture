# Windows PowerShell Launcher for Optical Fiber Lab
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   NUMERICAL APERTURE - OPTICAL FIBER 3D EXPERIMENT" -ForegroundColor Yellow
Write-Host "   B.Tech Physics Laboratory Suite" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".venv")) {
    Write-Host "[1/3] Creating Python virtual environment (.venv)..." -ForegroundColor Green
    python -m venv .venv
    Write-Host "[2/3] Installing requirements from requirements.txt..." -ForegroundColor Green
    & .\.venv\Scripts\python.exe -m pip install --upgrade pip
    & .\.venv\Scripts\python.exe -m pip install -r requirements.txt
}

Write-Host "[3/3] Launching laboratory experiment..." -ForegroundColor Green
& .\.venv\Scripts\python.exe main.py
