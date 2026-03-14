# ============================================================================
# Riada - Utilities: Error Handler
# ============================================================================
# Description: Validation and safe command execution helpers.

$loggerPath = Join-Path $PSScriptRoot 'logger.ps1'
if (Test-Path $loggerPath) {
    . $loggerPath
}

function Test-CommandSuccess {
    param(
        [int]$ExitCode,
        [string]$Message = 'Command failed'
    )

    if ($ExitCode -ne 0) {
        Write-Error-Log $Message
        return $false
    }

    return $true
}

function Test-FileExists {
    param(
        [string]$Path,
        [string]$Message
    )

    if (-not (Test-Path -Path $Path -PathType Leaf)) {
        $errorMsg = if ($Message) { $Message } else { "File not found: $Path" }
        Write-Error-Log $errorMsg
        return $false
    }

    return $true
}

function Test-DirectoryExists {
    param(
        [string]$Path,
        [string]$Message
    )

    if (-not (Test-Path -Path $Path -PathType Container)) {
        $errorMsg = if ($Message) { $Message } else { "Directory not found: $Path" }
        Write-Error-Log $errorMsg
        return $false
    }

    return $true
}

function Test-ProgramExists {
    param([string]$Program)
    return [bool](Get-Command $Program -ErrorAction SilentlyContinue)
}

function Test-PortAvailable {
    param([int]$Port)

    $inUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return ($null -eq $inUse)
}

function Require-File {
    param(
        [string]$Path,
        [string]$Message
    )

    if (-not (Test-FileExists -Path $Path -Message $Message)) {
        exit 1
    }
}

function Require-Directory {
    param(
        [string]$Path,
        [string]$Message
    )

    if (-not (Test-DirectoryExists -Path $Path -Message $Message)) {
        exit 1
    }
}

function Require-Program {
    param([string]$Program)

    if (-not (Test-ProgramExists -Program $Program)) {
        Write-Error-Log "Required program not found: $Program"
        Write-Info "Install $Program and add it to PATH."
        exit 1
    }
}

function Require-PortAvailable {
    param([int]$Port)

    if (-not (Test-PortAvailable -Port $Port)) {
        Write-Error-Log "Port $Port is already in use."
        Write-Info "Stop the process using this port, then retry."
        exit 1
    }
}

function Invoke-SafeCommand {
    param(
        [scriptblock]$ScriptBlock,
        [string]$ErrorMessage = 'Command failed'
    )

    try {
        & $ScriptBlock
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }

        if ($exitCode -ne 0) {
            Write-Error-Log "$ErrorMessage (exit code: $exitCode)"
            return $false
        }

        return $true
    }
    catch {
        Write-Error-Log "${ErrorMessage}: $($_.Exception.Message)"
        return $false
    }
}
