@echo off
REM ============================================================================
REM Riada - Windows launcher
REM ============================================================================
REM Usage:
REM   Double-click: launch.bat
REM   Command line: launch.bat [run|build-only|test-only|release|clean|health|docker|help]
REM ============================================================================

setlocal

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%launch.ps1"
set "INTERACTIVE=0"
set "LAUNCH_ARGS=%*"

if "%~1"=="" (
    set "INTERACTIVE=1"
    set "LAUNCH_ARGS=run"
)

if not exist "%PS_SCRIPT%" (
    echo ERROR: launch.ps1 not found at "%PS_SCRIPT%"
    pause
    exit /b 1
)

if "%INTERACTIVE%"=="1" (
    echo.
    echo Starting RIADA launcher in interactive mode...
    echo This window will stay open when the command ends.
    echo.
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %LAUNCH_ARGS%

set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" (
    echo.
    echo ERROR: launch failed with exit code %EXIT_CODE%.
)

if "%INTERACTIVE%"=="1" (
    echo.
    if "%EXIT_CODE%"=="0" (
        echo Launcher finished. Press any key to close this window.
    ) else (
        echo Launcher failed. Press any key to close this window.
    )
    pause >nul
) else if not "%EXIT_CODE%"=="0" (
    pause
)

exit /b %EXIT_CODE%
