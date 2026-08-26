@echo off
title SkillSphere AI — Backend Server (FastAPI)
echo ========================================================
echo   SkillSphere AI - MoSPI SIH26101 Backend Server
echo   Starting Uvicorn on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0"
python -m uvicorn backend.main:app --port 8000 --host 0.0.0.0 --reload
pause
