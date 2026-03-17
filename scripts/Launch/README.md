# Riada Launch Scripts

This folder contains launch entry points for backend-only and fullstack workflows.

## Files

- `launch.ps1` - Main Windows PowerShell launcher.
- `launch.bat` - Windows batch wrapper around `launch.ps1`.
- `launch.sh` - Linux/macOS launcher.
- `test.bat` - Quick verification of launcher prerequisites.
- `CREATE_SHORTCUT.ps1` - Creates a desktop shortcut to `launch.bat`.
- `CREATE_SHORTCUT.cmd` - Batch wrapper for shortcut creation.

## Quick start

### Windows (recommended)

```powershell
cd scripts\Launch
.\launch.ps1 run
```

Or double-click `launch.bat`.
By default (no argument), `launch.bat` starts **fullstack** (`backend + frontend`).

### Frontend only

```powershell
cd scripts\Launch
.\launch.ps1 frontend
```

### Fullstack (backend + frontend)

```powershell
cd scripts\Launch
.\launch.ps1 fullstack
```

### Linux/macOS

```bash
cd scripts/Launch
chmod +x launch.sh
./launch.sh run
```

## Supported commands

- `run` - restore, clean, build API, and launch API
- `build-only` - restore, clean, build backend
- `test-only` - restore, clean, build backend, run unit tests
- `release` - restore, clean, build backend in Release
- `frontend` - install deps if needed and run frontend dev server
- `frontend-build` - install deps if needed and build frontend
- `fullstack` - build backend then launch backend + frontend (reuses already-running API if detected)
- `clean` - remove `bin` and `obj`
- `health` - check `https://localhost:5275/health`
- `docker` - run Docker compose from `scripts\Docker`
- `help` - show command help

## Verify setup

Run:

```batch
test.bat
```

Expected result: all checks pass.

For CI/automation:

```batch
test.bat --no-pause
```

## Troubleshooting

- If `dotnet` is missing, install .NET SDK 8+.
- If `npm` is missing, install Node.js LTS.
- If launch fails with `Microsoft.AspNetCore.App, version 8.0.0 not found`, install ASP.NET Core Runtime 8.x (or SDK 8.x):
  - https://dotnet.microsoft.com/download/dotnet/8.0
- If backend build fails, run from repo root:
  - `dotnet restore Riada.sln` (or `dotnet restore src\Riada.API\Riada.API.csproj` if `.sln` is absent)
  - `dotnet build src\Riada.API\Riada.API.csproj`
- If frontend build fails, run:
  - `cd frontend && npm install && npm run build`
- If health check fails, ensure API is running first.
