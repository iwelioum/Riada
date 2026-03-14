# Riada Scripts

Automation scripts for local development and Docker execution.

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

### Windows

```powershell
cd scripts\Launch
.\launch.ps1 run
```

or double-click `scripts\Launch\launch.bat`.

### Linux/macOS

```bash
cd scripts/Launch
chmod +x launch.sh
./launch.sh run
```

### Docker

```powershell
cd scripts\Docker
docker compose up --build
```

## Validation

Use:

```batch
scripts\Launch\test.bat
```

This checks required launcher files, `.NET`, and key project paths.
