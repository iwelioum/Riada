@echo off
REM ============================================================================
REM Riada - Create Desktop Shortcut (wrapper)
REM ============================================================================

setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File ".\CREATE_SHORTCUT.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
    echo.
    echo ERROR: Failed to create shortcut.
    pause
)

exit /b %EXIT_CODE%
