# ============================================================================
# Riada - Launch Script (PowerShell)
# ============================================================================
# Description: Main automation entry point for local development.
# Usage: .\launch.ps1 [command] [options]
# ============================================================================

param(
    [Parameter(Position = 0)]
    [ValidateSet('run', 'build-only', 'test-only', 'release', 'docker', 'clean', 'health', 'frontend', 'frontend-build', 'fullstack', 'help', '')]
    [string]$Command = 'run',

    [switch]$VerboseOutput,
    [switch]$SkipValidation,
    [switch]$SkipClean
)

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptRoot '..\Utilities\logger.ps1')
. (Join-Path $ScriptRoot '..\Utilities\error-handler.ps1')

$script:Config = @{
    ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\..'))
    ApiProject  = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\..\src\Riada.API'))
    ApiCsproj   = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\..\src\Riada.API\Riada.API.csproj'))
    Solution    = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\..\Riada.sln'))
    UnitTests   = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\..\tests\Riada.UnitTests\Riada.UnitTests.csproj'))
    FrontendProject = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\..\frontend'))
    FrontendPackageJson = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\..\frontend\package.json'))
    ApiPort     = 7001
    ApiUrl      = 'https://localhost:7001'
    SwaggerUrl  = 'https://localhost:7001/swagger'
    HealthUrl   = 'https://localhost:7001/health'
    FrontendPort = 4200
    FrontendUrl  = 'http://localhost:4200'
    RunUrls     = @('https://localhost:7001', 'http://localhost:5001')
}

function Update-UrlsFromLaunchSettings {
    $launchSettingsPath = Join-Path $script:Config.ApiProject 'Properties\launchSettings.json'
    if (-not (Test-Path -Path $launchSettingsPath -PathType Leaf)) {
        return
    }

    try {
        $launchSettings = Get-Content -Path $launchSettingsPath -Raw | ConvertFrom-Json
        $profile = $launchSettings.profiles.PSObject.Properties | Select-Object -First 1
        if ($null -eq $profile) {
            return
        }

        $applicationUrl = $profile.Value.applicationUrl
        if ([string]::IsNullOrWhiteSpace($applicationUrl)) {
            return
        }

        $urls = $applicationUrl -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
        $httpsUrl = $urls | Where-Object { $_ -like 'https://*' } | Select-Object -First 1
        $primaryUrl = if ($httpsUrl) { $httpsUrl } else { $urls | Select-Object -First 1 }

        if (-not [string]::IsNullOrWhiteSpace($primaryUrl)) {
            $script:Config.ApiUrl = $primaryUrl.TrimEnd('/')
            $script:Config.SwaggerUrl = "$($script:Config.ApiUrl)/swagger"
            $script:Config.HealthUrl = "$($script:Config.ApiUrl)/health"
            $script:Config.RunUrls = $urls
        }
    }
    catch {
        Write-Warning-Log "Could not parse launchSettings.json. Using default URLs."
    }
}

Update-UrlsFromLaunchSettings

if ($VerboseOutput) {
    $VerbosePreference = 'Continue'
}

function Show-Help {
    Write-Host @"
RIADA API - Launch Script

USAGE:
  .\launch.ps1 [command] [options]

COMMANDS:
  run          Restore, build API, and launch the API (default)
  build-only   Restore and build API only
  test-only    Restore, build, and run unit tests
  release      Restore and build API in Release mode
  frontend     Install deps if needed and launch frontend dev server
  frontend-build Install deps if needed and build frontend
  fullstack    Build backend API, then launch backend + frontend
  clean        Remove bin/ and obj/ folders
  health       Check API health endpoint
  docker       Start services with Docker Compose
  help         Show this help

OPTIONS:
  -VerboseOutput   Show additional output
  -SkipValidation  Skip pre-checks
  -SkipClean       Skip clean step when building
"@
}

function Get-ApiTargetFramework {
    $csprojPath = Join-Path $script:Config.ApiProject 'Riada.API.csproj'
    if (-not (Test-Path -Path $csprojPath -PathType Leaf)) {
        return $null
    }

    try {
        [xml]$projectFile = Get-Content -Path $csprojPath -Raw
        $tfm = $projectFile.Project.PropertyGroup.TargetFramework | Select-Object -First 1

        if ([string]::IsNullOrWhiteSpace($tfm)) {
            $tfms = $projectFile.Project.PropertyGroup.TargetFrameworks | Select-Object -First 1
            if (-not [string]::IsNullOrWhiteSpace($tfms)) {
                $tfm = ($tfms -split ';')[0]
            }
        }

        return $tfm
    }
    catch {
        return $null
    }
}

function Get-MajorFromTfm {
    param([string]$Tfm)

    if ([string]::IsNullOrWhiteSpace($Tfm)) {
        return $null
    }

    if ($Tfm -match '^net(?<major>\d+)(\.\d+)?$') {
        return [int]$Matches['major']
    }

    return $null
}

function Test-AspNetRuntimeMajorInstalled {
    param([int]$Major)

    $runtimeList = & dotnet --list-runtimes 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $false
    }

    return [bool]($runtimeList | Where-Object { $_ -match "^Microsoft\.AspNetCore\.App\s+$Major\." })
}

function Get-RunningApiProcesses {
    return @(Get-Process -Name 'Riada.API' -ErrorAction SilentlyContinue)
}

function Get-PortFromUrl {
    param([string]$Url)

    try {
        $uri = [System.Uri]$Url
        return $uri.Port
    }
    catch {
        return $null
    }
}

function Invoke-Validation {
    param(
        [switch]$RequireAspNetRuntime,
        [switch]$RequireApiProcessStopped,
        [switch]$RequireFrontendProject,
        [switch]$RequireNpm
    )

    Write-Header 'VALIDATION'

    Write-Info 'Checking prerequisites...'
    Require-Program 'dotnet'
    Write-Success "dotnet found: $(dotnet --version)"

    Require-File -Path $script:Config.Solution -Message "Solution file not found: $($script:Config.Solution)"
    Write-Success 'Solution file found'

    Require-Directory -Path $script:Config.ApiProject -Message "API project folder not found: $($script:Config.ApiProject)"
    Require-File -Path $script:Config.ApiCsproj -Message "API project file not found: $($script:Config.ApiCsproj)"
    Write-Success 'API project folder found'

    if ($RequireFrontendProject) {
        Require-Directory -Path $script:Config.FrontendProject -Message "Frontend folder not found: $($script:Config.FrontendProject)"
        Require-File -Path $script:Config.FrontendPackageJson -Message "Frontend package.json not found: $($script:Config.FrontendPackageJson)"
        Write-Success 'Frontend project folder found'
    }

    if ($RequireNpm) {
        Require-Program 'npm'
        Write-Success "npm found: $(npm --version)"
    }

    if ($RequireAspNetRuntime) {
        $tfm = Get-ApiTargetFramework
        $requiredMajor = Get-MajorFromTfm -Tfm $tfm

        if ($null -ne $requiredMajor) {
            if (Test-AspNetRuntimeMajorInstalled -Major $requiredMajor) {
                Write-Success "ASP.NET runtime $requiredMajor.x found"
            }
            else {
                Write-Error-Log "Missing required runtime: Microsoft.AspNetCore.App $requiredMajor.x"
                Write-Info 'Installed ASP.NET runtimes:'
                $aspNetRuntimes = & dotnet --list-runtimes | Where-Object { $_ -like 'Microsoft.AspNetCore.App*' }
                if ($aspNetRuntimes) {
                    $aspNetRuntimes | ForEach-Object { Write-Host "  $_" }
                }
                else {
                    Write-Host '  (none)'
                }
                Write-Host ''
                Write-Info "Install ASP.NET Core Runtime $requiredMajor.x (or SDK $requiredMajor.x), then retry."
                Write-Info "Download: https://dotnet.microsoft.com/download/dotnet/$requiredMajor.0"
                exit 1
            }
        }
        else {
            Write-Warning-Log "Could not infer target framework from csproj. Skipping runtime version check."
        }
    }

    if (-not (Test-PortAvailable -Port $script:Config.ApiPort)) {
        Write-Warning-Log "Port $($script:Config.ApiPort) appears in use. API may already be running."
    }

    foreach ($url in $script:Config.RunUrls) {
        $port = Get-PortFromUrl -Url $url
        if ($null -ne $port -and -not (Test-PortAvailable -Port $port)) {
            Write-Warning-Log "Port $port is already in use ($url)."
        }
    }

    if ($RequireFrontendProject -and -not (Test-PortAvailable -Port $script:Config.FrontendPort)) {
        Write-Warning-Log "Port $($script:Config.FrontendPort) is already in use ($($script:Config.FrontendUrl))."
    }

    if ($RequireApiProcessStopped) {
        $runningProcesses = Get-RunningApiProcesses
        if ($runningProcesses.Count -gt 0) {
            Write-Error-Log 'Riada.API is already running. Stop it before rebuild/relaunch.'
            $runningProcesses | ForEach-Object {
                Write-Host "  PID: $($_.Id)  Started: $($_.StartTime)"
            }
            Write-Info 'Use Ctrl+C in the running API window, then rerun this command.'
            exit 1
        }
    }
}

function Invoke-Clean {
    Write-Header 'CLEAN'
    Write-Info 'Removing bin and obj directories...'

    $targets = Get-ChildItem -Path $script:Config.ProjectRoot -Recurse -Directory -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -eq 'bin' -or $_.Name -eq 'obj' }

    foreach ($target in $targets) {
        try {
            Remove-Item -Path $target.FullName -Recurse -Force -ErrorAction Stop
            Write-Debug-Log "Removed: $($target.FullName)"
        }
        catch {
            Write-Warning-Log "Unable to remove: $($target.FullName)"
        }
    }

    Write-Success 'Clean completed'
}

function Invoke-Restore {
    Write-Header 'RESTORE'
    Write-Info 'Running dotnet restore...'

    & dotnet restore $script:Config.Solution
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        Write-Error-Log "Restore failed (exit code: $exitCode)"
        exit $exitCode
    }

    Write-Success 'Restore successful'
}

function Invoke-Build {
    param(
        [ValidateSet('Debug', 'Release')]
        [string]$Configuration = 'Debug'
    )

    Write-Header "BUILD ($Configuration)"
    Write-Info "Running dotnet build $($script:Config.ApiCsproj) --configuration $Configuration..."

    & dotnet build $script:Config.ApiCsproj --configuration $Configuration
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        Write-Error-Log "Build failed (exit code: $exitCode)"
        exit $exitCode
    }

    Write-Success 'Build successful'
}

function Invoke-Test {
    Write-Header 'TEST'

    if (-not (Test-Path -Path $script:Config.UnitTests -PathType Leaf)) {
        Write-Warning-Log "Unit test project not found: $($script:Config.UnitTests)"
        return
    }

    Write-Info 'Running dotnet test...'
    & dotnet test $script:Config.UnitTests --verbosity minimal
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        Write-Error-Log "Unit tests failed (exit code: $exitCode)"
        exit $exitCode
    }

    Write-Success 'All unit tests passed'
}

function Invoke-FrontendInstallIfNeeded {
    $frontendNodeModules = Join-Path $script:Config.FrontendProject 'node_modules'
    $httpServerBin = Join-Path $frontendNodeModules '.bin\http-server'
    $angularCliInit = Join-Path $frontendNodeModules '@angular\cli\lib\init.js'
    $needsInstall = -not (Test-Path -Path $frontendNodeModules -PathType Container) -or
        -not (Test-Path -Path $httpServerBin -PathType Leaf) -or
        -not (Test-Path -Path $angularCliInit -PathType Leaf)

    if (-not $needsInstall) { return }

    Write-Header 'FRONTEND INSTALL'
    Write-Info "Installing/updating frontend dependencies in $($script:Config.FrontendProject)..."

    Push-Location $script:Config.FrontendProject
    try {
        & npm install --ignore-scripts
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
        if ($exitCode -ne 0) {
            Write-Error-Log "npm install failed (exit code: $exitCode)"
            exit $exitCode
        }
    }
    finally {
        Pop-Location
    }

    Write-Success 'Frontend dependencies installed'
}

function Invoke-FrontendBuild {
    Write-Header 'FRONTEND BUILD'
    Invoke-FrontendInstallIfNeeded

    Push-Location $script:Config.FrontendProject
    try {
        & npm run build
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
        if ($exitCode -ne 0) {
            Write-Error-Log "Frontend build failed (exit code: $exitCode)"
            exit $exitCode
        }
    }
    finally {
        Pop-Location
    }

    Write-Success 'Frontend build successful'
}

function Invoke-FrontendDev {
    Write-Header 'FRONTEND DEV'
    Invoke-FrontendInstallIfNeeded

    $frontendPort = $script:Config.FrontendPort
    Push-Location $script:Config.FrontendProject
    try {
        Write-Info "Starting Angular dev server on $($script:Config.FrontendUrl)..."
        Write-Host 'Press Ctrl+C to stop the frontend server.'
        Write-Host ''

        & npm run ng -- serve --port $frontendPort
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
        if ($exitCode -ne 0) {
            Write-Error-Log "Angular dev server failed (exit code: $exitCode)"
            exit $exitCode
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-Fullstack {
    Write-Header 'FULLSTACK'
    Invoke-FrontendInstallIfNeeded

    $frontendCommand = "Set-Location -LiteralPath '$($script:Config.FrontendProject)'; npm run ng -- serve --port $($script:Config.FrontendPort)"
    $frontendProcess = Start-Process -FilePath 'powershell' -ArgumentList @('-NoProfile', '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', $frontendCommand) -PassThru
    Write-Success "Frontend started in separate window (PID: $($frontendProcess.Id))"
    Write-Info "Frontend URL: $($script:Config.FrontendUrl)"
    Write-Info "Launching API in current window..."

    try {
        Invoke-Launch
    }
    finally {
        if ($frontendProcess -and -not $frontendProcess.HasExited) {
            Write-Info "Stopping frontend process PID $($frontendProcess.Id)..."
            Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

function Invoke-Launch {
    Write-Header 'RUN API'
    Write-Info "Changing directory to: $($script:Config.ApiProject)"
    Write-Info 'Starting API with dotnet run --no-build...'
    Write-Host ''
    Write-Host "Swagger: $($script:Config.SwaggerUrl)"
    Write-Host "API URL: $($script:Config.ApiUrl)"
    Write-Host "Health : $($script:Config.HealthUrl)"
    Write-Host 'Press Ctrl+C to stop the API.'
    Write-Host ''

    Push-Location $script:Config.ApiProject
    try {
        & dotnet run --no-build
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
        if ($exitCode -ne 0) {
            Write-Error-Log "dotnet run failed with exit code $exitCode"
            exit $exitCode
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-HealthCheck {
    Write-Header 'HEALTH CHECK'
    Write-Info "Checking: $($script:Config.HealthUrl)"

    try {
        $response = Invoke-WebRequest -Uri $script:Config.HealthUrl -SkipCertificateCheck -ErrorAction Stop
        Write-Success "API responded with HTTP $($response.StatusCode)"
        if ($response.Content) {
            Write-Host $response.Content
        }
    }
    catch {
        Write-Error-Log "Health check failed: $($_.Exception.Message)"
        exit 1
    }
}

function Invoke-Docker {
    Write-Header 'DOCKER'

    $composeFile = [System.IO.Path]::GetFullPath((Join-Path $ScriptRoot '..\Docker\docker-compose.yml'))
    Require-File -Path $composeFile -Message "docker-compose.yml not found: $composeFile"

    if (-not (Test-ProgramExists -Program 'docker')) {
        Write-Error-Log 'Docker is not installed or not available in PATH.'
        exit 1
    }

    Push-Location (Split-Path -Parent $composeFile)
    try {
        & docker compose version *> $null
        if ($LASTEXITCODE -eq 0) {
            Write-Info 'Running docker compose up --build...'
            & docker compose up --build
        }
        elseif (Test-ProgramExists -Program 'docker-compose') {
            Write-Info 'Running docker-compose up --build...'
            & docker-compose up --build
        }
        else {
            Write-Error-Log 'Neither "docker compose" nor "docker-compose" is available.'
            exit 1
        }

        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
        if ($exitCode -ne 0) {
            Write-Error-Log "Docker command failed with exit code $exitCode"
            exit $exitCode
        }
    }
    finally {
        Pop-Location
    }
}

Write-Header 'RIADA API AUTOMATION'

try {
    if (-not $SkipValidation -and $Command -ne 'help') {
        $requireAspNetRuntime = @('run', '', 'health', 'fullstack') -contains $Command
        $requireApiProcessStopped = @('run', '', 'build-only', 'test-only', 'release', 'clean') -contains $Command
        $requireFrontendProject = @('frontend', 'frontend-build', 'fullstack') -contains $Command
        $requireNpm = @('frontend', 'frontend-build', 'fullstack') -contains $Command
        Invoke-Validation `
            -RequireAspNetRuntime:$requireAspNetRuntime `
            -RequireApiProcessStopped:$requireApiProcessStopped `
            -RequireFrontendProject:$requireFrontendProject `
            -RequireNpm:$requireNpm
    }

    switch ($Command) {
        'help' {
            Show-Help
        }
        'clean' {
            Invoke-Clean
        }
        'build-only' {
            Invoke-Restore
            if (-not $SkipClean) {
                Invoke-Clean
            }
            Invoke-Build -Configuration 'Debug'
        }
        'test-only' {
            Invoke-Restore
            if (-not $SkipClean) {
                Invoke-Clean
            }
            Invoke-Build -Configuration 'Debug'
            Invoke-Test
        }
        'release' {
            Invoke-Restore
            if (-not $SkipClean) {
                Invoke-Clean
            }
            Invoke-Build -Configuration 'Release'
            Write-Success 'Release build completed'
        }
        'frontend-build' {
            Invoke-FrontendBuild
        }
        'frontend' {
            Invoke-FrontendDev
        }
        'fullstack' {
            $runningApi = Get-RunningApiProcesses
            if ($runningApi.Count -gt 0) {
                $runningPids = ($runningApi | Select-Object -ExpandProperty Id) -join ', '
                Write-Warning-Log "Riada.API is already running (PID: $runningPids). Reusing existing API instance."

                if (-not (Test-PortAvailable -Port $script:Config.FrontendPort)) {
                    Write-Warning-Log "Frontend port $($script:Config.FrontendPort) is already in use. Reusing existing frontend instance."
                    Write-Host "API URL: $($script:Config.ApiUrl)"
                    Write-Host "Frontend URL: $($script:Config.FrontendUrl)"
                    break
                }

                Invoke-FrontendDev
                break
            }

            Invoke-Restore
            if (-not $SkipClean) {
                Invoke-Clean
            }
            Invoke-Build -Configuration 'Debug'
            Invoke-Fullstack
        }
        'health' {
            Invoke-HealthCheck
        }
        'docker' {
            Invoke-Docker
        }
        { @('run', '') -contains $_ } {
            Invoke-Restore
            if (-not $SkipClean) {
                Invoke-Clean
            }
            Invoke-Build -Configuration 'Debug'
            Invoke-Launch
        }
        default {
            Write-Error-Log "Unknown command: $Command"
            Show-Help
            exit 1
        }
    }

    Write-Success 'Script completed successfully'
}
catch {
    Write-Error-Log "Unhandled error: $($_.Exception.Message)"
    exit 1
}
