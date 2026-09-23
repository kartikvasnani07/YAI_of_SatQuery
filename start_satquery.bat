@echo off
title SAT QUERY AI — SIH26167 Workstation Launcher
echo =========================================================================
echo               SAT QUERY AI — EARTH OBSERVATION WORKSTATION
echo                       Smart India Hackathon 2026
echo =========================================================================
echo Starting Backend API Server (FastAPI uvicorn on port 8000)...
start "SAT QUERY AI Backend API" /min cmd /c "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak > NUL

echo Starting Frontend UI Server (Vite React on port 3000)...
start "SAT QUERY AI Frontend UI" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak > NUL

echo Opening Web Browser at http://localhost:3000...
start http://localhost:3000

echo =========================================================================
echo SatQuery AI Application is running!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo Close this window to stop servers.
echo =========================================================================
pause
