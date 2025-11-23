@echo off
SETLOCAL

:: =============================================
::  Local Chat App Automated Startup Script
:: =============================================

set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%frontend
set FRONTEND_PORT=5173

color 0A

echo ==================================================
echo   Local Chat App Auto Starter
echo ==================================================

:: Check Node.js
echo [1/7] Checking Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
  echo   ERROR: Node.js not found. Install from https://nodejs.org/
  pause
  exit /b 1
)
for /f "delims=" %%V in ('node -v') do set NODE_VERSION=%%V
echo   Found Node.js version %NODE_VERSION%

:: Check npm
echo [2/7] Checking npm installation...
where npm >nul 2>&1
if errorlevel 1 (
  echo   ERROR: npm not found.
  pause
  exit /b 1
)
for /f "delims=" %%V in ('npm -v') do set NPM_VERSION=%%V
echo   Found npm version %NPM_VERSION%

:: Check backend dependencies
echo [3/7] Checking backend dependencies...
if not exist "%BACKEND_DIR%\node_modules" (
  echo   Installing backend dependencies...
  cd /d "%BACKEND_DIR%"
  call npm install
  if errorlevel 1 (
    echo   ERROR: Backend dependency installation failed.
    pause
    exit /b 1
  )
  cd /d "%ROOT_DIR%"
) else (
  echo   Backend dependencies already installed.
)

:: Check frontend dependencies
echo [4/7] Checking frontend dependencies...
if not exist "%FRONTEND_DIR%\node_modules" (
  echo   Installing frontend dependencies...
  cd /d "%FRONTEND_DIR%"
  call npm install
  if errorlevel 1 (
    echo   ERROR: Frontend dependency installation failed.
    pause
    exit /b 1
  )
  cd /d "%ROOT_DIR%"
) else (
  echo   Frontend dependencies already installed.
)

:: Start backend
echo [5/7] Starting backend server (nodemon)...
start "chat-backend" cmd /k "cd /d %BACKEND_DIR% && npm run dev"

:: Wait a bit for backend
ping 127.0.0.1 -n 3 >nul

:: Start frontend
echo [6/7] Starting frontend dev server (Vite)...
start "chat-frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

:: Wait for frontend to start
echo   Waiting for frontend to start...
ping 127.0.0.1 -n 5 >nul

:: Get LAN IP
echo [7/7] Determining LAN IP...
for /f "delims=" %%I in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1'} | Select-Object -First 1 -ExpandProperty IPAddress)"') do set LAN_IP=%%I
if not defined LAN_IP set LAN_IP=localhost

set LOCAL_URL=http://localhost:%FRONTEND_PORT%
set LAN_URL=http://%LAN_IP%:%FRONTEND_PORT%

:: Open browsers
echo   Opening browser:
echo     Local: %LOCAL_URL%
echo     LAN:   %LAN_URL%
start "" "%LOCAL_URL%"
start "" "%LAN_URL%"

echo --------------------------------------------------
echo   Startup complete!
echo   Close the spawned cmd windows to stop servers.
echo --------------------------------------------------
pause

ENDLOCAL
