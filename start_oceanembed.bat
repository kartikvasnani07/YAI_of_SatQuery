@echo off
title OCEANEMBED Workstation Launcher — SIH26066
echo =========================================================================
echo       OCEANEMBED — SUBSURFACE OCEAN TEMPERATURE RECONSTRUCTION
echo                     Ministry of Earth Sciences (MoES) / INCOIS
echo                           Smart India Hackathon 2026
echo =========================================================================
echo Starting Backend API Server (FastAPI uvicorn on port 8000)...
start "OCEANEMBED Backend API" /min cmd /c "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak > NUL

echo Starting Frontend UI Server (Vite React on port 3000)...
start "OCEANEMBED Frontend UI" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak > NUL

echo Opening Web Browser at http://localhost:3000...
start http://localhost:3000

echo =========================================================================
echo OCEANEMBED Application is running!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo =========================================================================
pause
