# Riada Scripts

Automation scripts for backend and frontend development.

## Current structure

```text
scripts/
|-- Launch/
|   |-- launch.ps1
|   |-- launch.bat
|   |-- launch.sh
|   |-- test.bat
|   |-- CREATE_SHORTCUT.ps1
|   |-- CREATE_SHORTCUT.cmd
|   `-- README.md
|-- Docker/
|   |-- Dockerfile
|   `-- docker-compose.yml
|-- Utilities/
|   |-- logger.ps1
|   `-- error-handler.ps1
`-- Config/
    |-- config.json
    `-- .env.example
```

## Quick start

### Backend only (Windows)

```powershell
cd scripts\Launch
.\launch.ps1 run
```

### Frontend only (Windows)

```powershell
cd scripts\Launch
.\launch.ps1 frontend
```

### Fullstack (Windows)

```powershell
cd scripts\Launch
.\launch.ps1 fullstack
```

Double-clicking `launch.bat` also starts fullstack mode by default.
If API is already running, fullstack mode reuses it and launches/reuses frontend.

### Linux/macOS

```bash
cd scripts/Launch
chmod +x launch.sh
./launch.sh run
```

### Docker

```powershell
cd scripts\Docker
docker compose --env-file ..\..\.env --profile docker up --build

# API only with local WampServer MySQL
docker compose --env-file ..\..\.env --profile local up --build
```

## Validation

Use:

```batch
scripts\Launch\test.bat
```

This checks launcher files, backend/frontend project paths, and required tools (`dotnet`, `npm`).
