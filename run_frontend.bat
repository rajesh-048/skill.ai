@echo off
title SkillSphere AI — Frontend Server (Vite + React)
echo ========================================================
echo   SkillSphere AI - Frontend Dev Server
echo   Starting Vite on http://localhost:5173
echo ========================================================
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "%~dp0\frontend"
npm run dev
pause
