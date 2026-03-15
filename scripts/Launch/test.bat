@echo off
REM ============================================================================
REM Riada - Launch scripts verification
REM ============================================================================
REM Usage:
REM   test.bat
REM ============================================================================

setlocal enabledelayedexpansion

set "TESTS_PASSED=0"
set "TESTS_FAILED=0"
set "TOTAL_TESTS=10"
set "ROOT_DIR=%~dp0..\..\"
set "NO_PAUSE=0"
if /I "%~1"=="--no-pause" set "NO_PAUSE=1"

echo.
echo ============================================================================
echo RIADA LAUNCHER - VERIFICATION
echo ============================================================================
echo.

echo Test 1: launch.ps1 exists
if exist "%~dp0launch.ps1" (
  echo   PASS
  set /a TESTS_PASSED+=1
) else (
  echo   FAIL
  set /a TESTS_FAILED+=1
)

echo Test 2: launch.bat exists
if exist "%~dp0launch.bat" (
  echo   PASS
  set /a TESTS_PASSED+=1
) else (
  echo   FAIL
  set /a TESTS_FAILED+=1
)

echo Test 3: launch.sh exists
if exist "%~dp0launch.sh" (
  echo   PASS
  set /a TESTS_PASSED+=1
) else (
  echo   FAIL
  set /a TESTS_FAILED+=1
)

echo Test 4: Riada.sln exists
if exist "%ROOT_DIR%Riada.sln" (
  echo   PASS
  set /a TESTS_PASSED+=1
) else (
  echo   FAIL
  set /a TESTS_FAILED+=1
)

echo Test 5: src\Riada.API exists
if exist "%ROOT_DIR%src\Riada.API\" (
  echo   PASS
  set /a TESTS_PASSED+=1
) else (
  echo   FAIL
  set /a TESTS_FAILED+=1
)

echo Test 6: frontend\package.json exists
if exist "%ROOT_DIR%frontend\package.json" (
  echo   PASS
  set /a TESTS_PASSED+=1
) else (
  echo   FAIL
  set /a TESTS_FAILED+=1
)

echo Test 7: npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
  echo   FAIL
  set /a TESTS_FAILED+=1
) else (
  for /f "tokens=*" %%i in ('npm --version') do set "NPM_VER=%%i"
  echo   PASS - Version: !NPM_VER!
  set /a TESTS_PASSED+=1
)

echo Test 8: dotnet is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
  echo   FAIL
  set /a TESTS_FAILED+=1
) else (
  for /f "tokens=*" %%i in ('dotnet --version') do set "DOTNET_VER=%%i"
  echo   PASS - Version: !DOTNET_VER!
  set /a TESTS_PASSED+=1
)

echo Test 9: ASP.NET Core runtime 8.x is installed
dotnet --list-runtimes | findstr /R /C:"Microsoft\.AspNetCore\.App 8\." >nul 2>&1
if errorlevel 1 (
  echo   FAIL - Missing Microsoft.AspNetCore.App 8.x
  echo   Install from: https://dotnet.microsoft.com/download/dotnet/8.0
  set /a TESTS_FAILED+=1
) else (
  echo   PASS
  set /a TESTS_PASSED+=1
)

echo Test 10: Riada.API process is not already running
tasklist /FI "IMAGENAME eq Riada.API.exe" 2>nul | find /I "Riada.API.exe" >nul
if errorlevel 1 (
  echo   PASS
  set /a TESTS_PASSED+=1
) else (
  echo   FAIL - Riada.API is already running and may lock build files
  echo   Stop it with Ctrl+C in the existing API window, then retry.
  set /a TESTS_FAILED+=1
)

echo.
echo ============================================================================
echo TEST SUMMARY
echo ============================================================================
echo.
echo Passed: !TESTS_PASSED!/!TOTAL_TESTS!
echo Failed: !TESTS_FAILED!/!TOTAL_TESTS!
echo.

if !TESTS_FAILED! EQU 0 (
  echo ALL CHECKS PASSED.
  echo You can run: launch.bat
) else (
  echo SOME CHECKS FAILED.
  echo Fix the errors above, then run this script again.
)

echo.
if "%NO_PAUSE%"=="0" pause
