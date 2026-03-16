param(
    [string]$BaselinePath = "docs/PERFORMANCE_BASELINE.md",
    [string]$OutputPath = "artifacts/monitoring/perf-baseline-gate.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$requiredChecks = @(
    @{ Name = "Cycle6 target section"; Pattern = "### End of Cycle 6 Targets" },
    @{ Name = "FCP target"; Pattern = "- FCP: <0\.5s" },
    @{ Name = "LCP target"; Pattern = "- LCP: <1\.0s" },
    @{ Name = "Bundle target"; Pattern = "- Bundle Size: <200KB gzipped" },
    @{ Name = "Memory target"; Pattern = "- Memory: <30MB heap" },
    @{ Name = "Lighthouse target"; Pattern = "- Lighthouse Score: 95\+" }
)

if (-not (Test-Path -LiteralPath $BaselinePath)) {
    throw "Performance baseline file not found: $BaselinePath"
}

$content = Get-Content -LiteralPath $BaselinePath -Raw -Encoding UTF8
$results = foreach ($check in $requiredChecks) {
    $passed = [regex]::IsMatch($content, $check.Pattern)
    [pscustomobject]@{
        Name = $check.Name
        Passed = $passed
    }
}

$overallPassed = -not ($results.Passed -contains $false)
$summary = [pscustomobject]@{
    TimestampUtc = [DateTime]::UtcNow.ToString("o")
    BaselinePath = $BaselinePath
    Passed = $overallPassed
    Checks = $results
}

$outputDirectory = Split-Path -Parent $OutputPath
if ([string]::IsNullOrWhiteSpace($outputDirectory)) {
    $outputDirectory = "."
}

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$summary | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutputPath -Encoding UTF8

if (-not $overallPassed) {
    $failedChecks = ($results | Where-Object { -not $_.Passed } | ForEach-Object { $_.Name }) -join ", "
    throw "Performance baseline quality gate failed. Missing checks: $failedChecks"
}

Write-Host "Performance baseline quality gate: passed"
Write-Host "Summary: $OutputPath"
