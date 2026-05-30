@echo off
title Khanna Portfolio Server Launcher
echo ========================================================
echo   ✦ PRIYANSHI BAHORE PORTFOLIO SERVER LAUNCHER ✦
echo ========================================================
echo.
echo   [1/2] Changing directory to project root...
cd /d "%~dp0"
echo   [2/2] Launching your portfolio in default browser...
start "" "http://localhost:3000"
echo.
echo   🚀 Starting Node.js Express server on port 3000...
echo   (Keep this terminal window open to watch the website!)
echo ========================================================
echo.
npm start
if %ERRORLEVEL% neq 0 (
  echo.
  echo  [ERROR] Failed to start server. Make sure Node.js is installed
  echo  and you have run 'npm install' in this folder.
  echo.
  pause
)
