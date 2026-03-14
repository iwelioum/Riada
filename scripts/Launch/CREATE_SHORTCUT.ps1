# ============================================================================
# Riada - Create Desktop Shortcut
# ============================================================================
# Description: Creates a desktop shortcut to launch.bat.
# Usage: powershell -ExecutionPolicy Bypass -File .\CREATE_SHORTCUT.ps1
# ============================================================================

param(
    [string]$ShortcutName = 'Launch Riada API'
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir '..\..'))
$targetBatch = Join-Path $scriptDir 'launch.bat'

if (-not (Test-Path -Path $targetBatch -PathType Leaf)) {
    Write-Host "ERROR: launch.bat not found at $targetBatch" -ForegroundColor Red
    exit 1
}

$desktopDir = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopDir ($ShortcutName + '.lnk')

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetBatch
$shortcut.WorkingDirectory = $projectRoot
$shortcut.WindowStyle = 1
$shortcut.IconLocation = 'C:\Windows\System32\cmd.exe,0'
$shortcut.Description = 'Launch Riada API (restore, build, test, run)'
$shortcut.Save()

Write-Host "Shortcut created: $shortcutPath" -ForegroundColor Green
