@echo off
REM Quick startup script for the full project

echo.
echo ========================================
echo    ShopDB Full-Stack Project Startup
echo ========================================
echo.

REM Check if backend process is running and stop it
echo [1/4] Checking for running backend process...
tasklist | find /i "node" >nul
if %errorlevel% == 0 (
    echo Found running Node process. Stopping...
    taskkill /IM node.exe /F 2>nul
    timeout /t 2 /nobreak
) else (
    echo No Node process running.
)
echo.

REM Start backend in background
echo [2/4] Starting backend server (Node.js on port 5000)...
cd backend
start "Backend Server" cmd /k npm start
timeout /t 3 /nobreak
echo.

REM Start frontend in new window
echo [3/4] Starting frontend (React on port 3000)...
cd ..\frontend
start "Frontend Server" cmd /k npm start
timeout /t 3 /nobreak
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo    Servers should be starting now:
echo    - Backend:  http://localhost:5000
echo    - Frontend: http://localhost:3000
echo ========================================
echo.
echo Wait 10-15 seconds for servers to fully start.
echo Open browser and go to: http://localhost:3000
echo.
pause
