@echo off
title SkillSphere AI — Complete Product Launcher
echo ===================================================================
echo     SkillSphere AI - MoSPI SIH26101 Working Prototype
echo     "Know Your Gaps. Learn Smarter. Grow Faster."
echo ===================================================================
echo.
echo Starting Backend (FastAPI on port 8000)...
start "SkillSphere Backend" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --port 8000 --host 0.0.0.0 --reload"

echo Starting Frontend (Vite on port 5173)...
start "SkillSphere Frontend" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH% && cd /d %~dp0\frontend && npm run dev"

echo.
echo ===================================================================
echo Application launched!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ===================================================================
timeout /t 5
start http://localhost:5173
