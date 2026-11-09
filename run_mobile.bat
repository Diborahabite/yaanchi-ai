@echo off
title Yanchi AI Mobile App
echo ====================================================
echo  Starting Yanchi AI Mobile App (Expo)
echo ====================================================
cd /d "%~dp0mobile"
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)
npx expo start
pause

