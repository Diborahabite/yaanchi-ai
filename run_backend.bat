@echo off
title Yanchi AI Backend Server
echo ====================================================
echo  Starting Yanchi AI FastAPI Backend (Port 8000)
echo ====================================================
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe main.py
) else (
    python main.py
)
pause

