[CmdletBinding()]
param(
    [string]$SqlFile,
    [string]$OutputPath,
    [string]$DbHost = $env:RIADA_DB_HOST,
    [string]$DbPort = $env:RIADA_DB_PORT,
    [string]$DbName = $env:RIADA_DB_NAME,
    [string]$DbUser = $env:RIADA_DB_USER,
    [string]$DbPassword = $env:RIADA_DB_PASSWORD,
    [switch]$RequireDatabase,
    [switch]$FailOnWarning
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

if ([string]::IsNullOrWhiteSpace($SqlFile)) {
    $SqlFile = Join-Path $repoRoot 'sql\11_Monitoring_DB_Security_Health.sql'
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $repoRoot 'artifacts\monitoring\db-security-health.txt'
}

if ([string]::IsNullOrWhiteSpace($DbHost)) { $DbHost = '127.0.0.1' }
if ([string]::IsNullOrWhiteSpace($DbPort)) { $DbPort = '3306' }
if ([string]::IsNullOrWhiteSpace($DbName)) { $DbName = 'riada_db' }
if ([string]::IsNullOrWhiteSpace($DbUser)) { $DbUser = 'root' }

$outputDirectory = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outputDirectory)) {
    New-Item -Path $outputDirectory -ItemType Directory -Force | Out-Null
}

$summaryPath = [System.IO.Path]::ChangeExtension($OutputPath, '.summary.json')
$timestampUtc = (Get-Date).ToUniversalTime().ToString('o')

function Write-SummaryFile {
    param(
        [string]$Result,
        [string]$Reason,
        [int]$ExitCode,
        [int]$OkCount = 0,
        [int]$WarnCount = 0,
        [int]$CriticalCount = 0
    )

    $summary = [ordered]@{
        timestamp_utc    = $timestampUtc
        result           = $Result
        reason           = $Reason
        exit_code        = $ExitCode
        output_file      = $OutputPath
        summary_file     = $summaryPath
        sql_file         = $SqlFile
        db_host          = $DbHost
        db_port          = $DbPort
        db_name          = $DbName
        require_database = [bool]$RequireDatabase
        fail_on_warning  = [bool]$FailOnWarning
        ok_checks        = $OkCount
        warn_checks      = $WarnCount
        critical_checks  = $CriticalCount
    }

    $summary | ConvertTo-Json -Depth 4 | Set-Content -Path $summaryPath -Encoding UTF8
}

if (-not (Test-Path -Path $SqlFile -PathType Leaf)) {
    $missingFileMessage = "SQL monitoring file not found: $SqlFile"
    $missingFileMessage | Set-Content -Path $OutputPath -Encoding UTF8
    Write-SummaryFile -Result 'failed' -Reason $missingFileMessage -ExitCode 1
    Write-Error $missingFileMessage
    exit 1
}

$mysqlCommand = Get-Command mysql -ErrorAction SilentlyContinue
if ($null -eq $mysqlCommand) {
    $skipReason = 'mysql CLI not found in PATH. Install mysql client or run with -RequireDatabase:$false.'
    $skipReason | Set-Content -Path $OutputPath -Encoding UTF8

    if ($RequireDatabase) {
        Write-SummaryFile -Result 'failed' -Reason $skipReason -ExitCode 1
        Write-Error $skipReason
        exit 1
    }

    Write-SummaryFile -Result 'skipped' -Reason $skipReason -ExitCode 0
    Write-Warning $skipReason
    exit 0
}

$mysqlArgs = @(
    "--host=$DbHost"
    "--port=$DbPort"
    "--user=$DbUser"
    "--database=$DbName"
    '--batch'
    '--raw'
)

if (-not [string]::IsNullOrWhiteSpace($DbPassword)) {
    $mysqlArgs += "--password=$DbPassword"
}

$probeOutput = & $mysqlCommand.Source @mysqlArgs --execute "SELECT 1;" 2>&1
$probeExitCode = $LASTEXITCODE
if ($probeExitCode -ne 0) {
    $probeText = ($probeOutput -join [Environment]::NewLine)
    $probeText | Set-Content -Path $OutputPath -Encoding UTF8

    if ($RequireDatabase) {
        $probeFailureReason = "Database probe failed with exit code $probeExitCode."
        Write-SummaryFile -Result 'failed' -Reason $probeFailureReason -ExitCode $probeExitCode
        Write-Error $probeFailureReason
        exit $probeExitCode
    }

    $softSkipReason = "Database probe unavailable (exit code $probeExitCode). Soft-skipping runtime checks."
    Write-SummaryFile -Result 'skipped' -Reason $softSkipReason -ExitCode 0
    Write-Warning $softSkipReason
    exit 0
}

$sqlContent = Get-Content -Path $SqlFile -Raw
$commandOutput = $sqlContent | & $mysqlCommand.Source @mysqlArgs 2>&1
$executionExitCode = $LASTEXITCODE
$outputText = ($commandOutput -join [Environment]::NewLine)
$outputText | Set-Content -Path $OutputPath -Encoding UTF8

if ($executionExitCode -ne 0) {
    $executionFailureReason = "Monitoring SQL execution failed with exit code $executionExitCode."
    Write-SummaryFile -Result 'failed' -Reason $executionFailureReason -ExitCode $executionExitCode
    Write-Error $executionFailureReason
    exit $executionExitCode
}

$criticalCount = ([regex]::Matches($outputText, '(?m)^[A-Z][0-9]{2}\t[^\t]+\tCRITICAL\t')).Count
$warnCount = ([regex]::Matches($outputText, '(?m)^[A-Z][0-9]{2}\t[^\t]+\tWARN\t')).Count
$okCount = ([regex]::Matches($outputText, '(?m)^[A-Z][0-9]{2}\t[^\t]+\tOK\t')).Count

if ($criticalCount -gt 0) {
    Write-SummaryFile -Result 'critical' -Reason 'Critical checks detected.' -ExitCode 2 -OkCount $okCount -WarnCount $warnCount -CriticalCount $criticalCount
    Write-Error "Critical DB/security checks detected: $criticalCount. See $OutputPath"
    exit 2
}

if ($FailOnWarning -and $warnCount -gt 0) {
    Write-SummaryFile -Result 'warn' -Reason 'Warnings detected and FailOnWarning is enabled.' -ExitCode 3 -OkCount $okCount -WarnCount $warnCount -CriticalCount $criticalCount
    Write-Error "Warning checks detected: $warnCount. Failing because -FailOnWarning is enabled."
    exit 3
}

if ($warnCount -gt 0) {
    Write-SummaryFile -Result 'warn' -Reason 'Warnings detected.' -ExitCode 0 -OkCount $okCount -WarnCount $warnCount -CriticalCount $criticalCount
    Write-Warning "DB/security checks completed with warnings (WARN=$warnCount). See $OutputPath"
    exit 0
}

Write-SummaryFile -Result 'ok' -Reason 'All checks are OK.' -ExitCode 0 -OkCount $okCount -WarnCount $warnCount -CriticalCount $criticalCount
Write-Host "DB/security checks completed successfully (OK=$okCount, WARN=$warnCount, CRITICAL=$criticalCount)."
exit 0
