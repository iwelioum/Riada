[CmdletBinding()]
param(
    [switch]$Ci,
    [switch]$RequireDatabase,
    [switch]$FailOnWarning
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$outputDirectory = Join-Path $repoRoot 'artifacts\monitoring'
New-Item -Path $outputDirectory -ItemType Directory -Force | Out-Null

$wrapperSummaryPath = Join-Path $outputDirectory 'monitoring-wrapper-summary.json'
$dbOutputPath = Join-Path $outputDirectory 'db-security-health.txt'
$dbSummaryPath = [System.IO.Path]::ChangeExtension($dbOutputPath, '.summary.json')
$dbScriptPath = Join-Path $PSScriptRoot 'Invoke-DbSecurityHealthCheck.ps1'

$requiredFiles = @(
    (Join-Path $repoRoot 'sql\11_Monitoring_DB_Security_Health.sql'),
    $dbScriptPath,
    (Join-Path $repoRoot 'docs\MONITORING_OPERABILITY.md')
)

$missingFiles = @()
foreach ($requiredFile in $requiredFiles) {
    if (-not (Test-Path -Path $requiredFile -PathType Leaf)) {
        $missingFiles += $requiredFile
    }
}

$maxAuditAgeDays = 45
$auditFreshness = @()
foreach ($auditFileName in @('SECURITY_AUDIT_REPORT.md', 'DATABASE_AUDIT_REPORT.md')) {
    $auditFilePath = Join-Path $repoRoot $auditFileName
    if (Test-Path -Path $auditFilePath -PathType Leaf) {
        $auditFile = Get-Item -Path $auditFilePath
        $ageDays = [math]::Round(((Get-Date).ToUniversalTime() - $auditFile.LastWriteTimeUtc).TotalDays, 2)
        $auditFreshness += [ordered]@{
            file      = $auditFileName
            exists    = $true
            age_days  = $ageDays
            max_days  = $maxAuditAgeDays
            is_stale  = ($ageDays -gt $maxAuditAgeDays)
        }
    }
    else {
        $auditFreshness += [ordered]@{
            file      = $auditFileName
            exists    = $false
            age_days  = $null
            max_days  = $maxAuditAgeDays
            is_stale  = $false
        }
    }
}

if ($missingFiles.Count -gt 0) {
    foreach ($missingFile in $missingFiles) {
        Write-Error "Required monitoring file missing: $missingFile"
        if ($Ci) {
            Write-Host "::error::Required monitoring file missing: $missingFile"
        }
    }

    $failureSummary = [ordered]@{
        timestamp_utc = (Get-Date).ToUniversalTime().ToString('o')
        result        = 'failed'
        reason        = 'Required monitoring files are missing.'
        missing_files = $missingFiles
        db_exit_code  = $null
        db_summary    = $null
        audit_reports = $auditFreshness
    }
    $failureSummary | ConvertTo-Json -Depth 6 | Set-Content -Path $wrapperSummaryPath -Encoding UTF8
    exit 1
}

$runnerCommand = Get-Command pwsh -ErrorAction SilentlyContinue
if ($null -eq $runnerCommand) {
    $runnerCommand = Get-Command powershell -ErrorAction SilentlyContinue
}

if ($null -eq $runnerCommand) {
    $missingRunnerReason = 'Neither pwsh nor powershell executable is available in PATH.'
    $failureSummary = [ordered]@{
        timestamp_utc = (Get-Date).ToUniversalTime().ToString('o')
        result        = 'failed'
        reason        = $missingRunnerReason
        missing_files = @()
        db_exit_code  = $null
        db_summary    = $null
        audit_reports = $auditFreshness
    }
    $failureSummary | ConvertTo-Json -Depth 6 | Set-Content -Path $wrapperSummaryPath -Encoding UTF8
    Write-Error $missingRunnerReason
    exit 1
}

$dbArgs = @(
    '-NoProfile'
    '-File'
    $dbScriptPath
    '-OutputPath'
    $dbOutputPath
)

if ($RequireDatabase) { $dbArgs += '-RequireDatabase' }
if ($FailOnWarning) { $dbArgs += '-FailOnWarning' }

& $runnerCommand.Source @dbArgs
$dbExitCode = $LASTEXITCODE

$dbSummary = $null
if (Test-Path -Path $dbSummaryPath -PathType Leaf) {
    try {
        $dbSummary = Get-Content -Path $dbSummaryPath -Raw | ConvertFrom-Json
    }
    catch {
        Write-Warning "Failed to parse DB summary file: $dbSummaryPath"
    }
}

$staleAudits = @($auditFreshness | Where-Object { $_.exists -and $_.is_stale })
$status = 'passed'
if ($dbExitCode -ne 0) {
    $status = 'failed'
}
elseif ($staleAudits.Count -gt 0 -or ($dbSummary -and $dbSummary.result -eq 'warn')) {
    $status = 'passed_with_warnings'
}

$wrapperSummary = [ordered]@{
    timestamp_utc = (Get-Date).ToUniversalTime().ToString('o')
    result        = $status
    missing_files = @()
    db_exit_code  = $dbExitCode
    db_summary    = $dbSummary
    audit_reports = $auditFreshness
}
$wrapperSummary | ConvertTo-Json -Depth 7 | Set-Content -Path $wrapperSummaryPath -Encoding UTF8

if ($dbSummary -and $dbSummary.result -eq 'skipped') {
    $skipMessage = 'DB runtime query skipped (database unavailable or mysql missing).'
    Write-Warning $skipMessage
    if ($Ci) {
        Write-Host "::warning::$skipMessage"
    }
}

foreach ($staleAudit in $staleAudits) {
    $staleMessage = "$($staleAudit.file) is stale ($($staleAudit.age_days) days old; max=$($staleAudit.max_days))."
    Write-Warning $staleMessage
    if ($Ci) {
        Write-Host "::warning::$staleMessage"
    }
}

Write-Host "Monitoring wrapper status: $status"
Write-Host "Wrapper summary: $wrapperSummaryPath"
Write-Host "DB check output: $dbOutputPath"

if ($status -eq 'failed') {
    if ($Ci) {
        Write-Host "::error::Monitoring checks failed. Review artifacts/monitoring output."
    }
    exit 1
}

exit 0
