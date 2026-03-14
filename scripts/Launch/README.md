# Riada Launch Scripts

This folder contains the launch entry points used during development.

## Files

- `launch.ps1` - Main Windows PowerShell launcher.
- `launch.bat` - Windows batch wrapper around `launch.ps1`.
- `launch.sh` - Linux/macOS launcher.
- `test.bat` - Quick local verification for required launch files.
- `CREATE_SHORTCUT.ps1` - Creates a desktop shortcut to `launch.bat`.
- `CREATE_SHORTCUT.cmd` - Batch wrapper to run shortcut creation.

## Quick start

### Windows (recommended)

```powershell
cd scripts\Launch
.\launch.ps1 run
```

Or double-click `launch.bat`.

### Linux/macOS

```bash
cd scripts/Launch
chmod +x launch.sh
./launch.sh run
```

## Supported commands

- `run` - restore, clean, build, test, and launch API
- `build-only` - restore, clean, build
- `test-only` - restore, clean, build, test
- `release` - restore, clean, build Release
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
- If launch fails with `Microsoft.AspNetCore.App, version 8.0.0 not found`, install ASP.NET Core Runtime 8.x (or SDK 8.x):
  - https://dotnet.microsoft.com/download/dotnet/8.0
- If build fails, run from repo root:
  - `dotnet restore Riada.sln`
  - `dotnet build Riada.sln`
- If health check fails, ensure API is running first.
- If build fails with file lock errors (`MSB3021`/`MSB3027`), an old `Riada.API` process is still running:
  - Stop the old API window with `Ctrl+C`
  - Run again
