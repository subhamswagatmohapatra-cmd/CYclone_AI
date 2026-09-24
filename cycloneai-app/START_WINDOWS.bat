@echo off
title CycloneAI Disaster Management Platform
echo ========================================================
echo   Starting CycloneAI Disaster Management Platform
echo ========================================================
echo.
echo Checking Node.js environment on your laptop...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from https://nodejs.org/ (v18 or higher LTS).
    echo After installing Node.js, run this file again.
    echo.
    pause
    exit /b 1
)

echo Node.js detected! Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install encountered an error.
    pause
    exit /b 1
)

echo Starting local development server on http://localhost:3000 ...
call npm run dev
pause
