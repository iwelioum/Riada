# ============================================================================
# Riada - Utilities: Logger
# ============================================================================
# Description: Shared logging helpers for PowerShell scripts.

$script:Colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
    Debug   = 'Gray'
}

$script:TimestampFormat = 'yyyy-MM-dd HH:mm:ss'

function Write-Info {
    param([string]$Message)
    $timestamp = Get-Date -Format $script:TimestampFormat
    Write-Host "[$timestamp] [INFO ] $Message" -ForegroundColor $script:Colors.Info
}

function Write-Success {
    param([string]$Message)
    $timestamp = Get-Date -Format $script:TimestampFormat
    Write-Host "[$timestamp] [OK   ] $Message" -ForegroundColor $script:Colors.Success
}

function Write-Error-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format $script:TimestampFormat
    Write-Host "[$timestamp] [ERROR] $Message" -ForegroundColor $script:Colors.Error
}

function Write-Warning-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format $script:TimestampFormat
    Write-Host "[$timestamp] [WARN ] $Message" -ForegroundColor $script:Colors.Warning
}

function Write-Debug-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format $script:TimestampFormat
    Write-Host "[$timestamp] [DEBUG] $Message" -ForegroundColor $script:Colors.Debug
}

function Write-Header {
    param([string]$Text)
    $line = '=============================================================================='
    Write-Host ''
    Write-Host $line -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host $line -ForegroundColor Cyan
    Write-Host ''
}

function Write-Separator {
    Write-Host '------------------------------------------------------------------------------' -ForegroundColor Gray
}
