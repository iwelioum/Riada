# Monitoring Operability — DB & Security (Cycle 4)

This cycle adds lightweight monitoring hooks for runtime database and security health checks.

## Artifacts

- SQL runtime checks: `sql/11_Monitoring_DB_Security_Health.sql`
- DB/security runner: `scripts/Monitoring/Invoke-DbSecurityHealthCheck.ps1`
- CI wrapper: `scripts/Monitoring/Run-MonitoringChecks.ps1`
- CI workflow: `.github/workflows/ci-monitoring.yml`

## Local Usage

### 1) CI-safe run (default)

```powershell
pwsh -File scripts\Monitoring\Run-MonitoringChecks.ps1
```

- Validates monitoring assets.
- Runs DB query only if mysql client + DB connectivity are available.
- Soft-skips DB runtime query when unavailable (non-disruptive mode).

### 2) Enforce DB reachability (production gate)

```powershell
pwsh -File scripts\Monitoring\Run-MonitoringChecks.ps1 -RequireDatabase
```

### 3) Fail on warnings too

```powershell
pwsh -File scripts\Monitoring\Run-MonitoringChecks.ps1 -RequireDatabase -FailOnWarning
```

## DB Connection Environment Variables

- `RIADA_DB_HOST` (default: `127.0.0.1`)
- `RIADA_DB_PORT` (default: `3306`)
- `RIADA_DB_NAME` (default: `riada_db`)
- `RIADA_DB_USER` (default: `root`)
- `RIADA_DB_PASSWORD` (optional)

## Outputs

All outputs are written under `artifacts/monitoring/`:

- `db-security-health.txt` — raw SQL check output
- `db-security-health.summary.json` — parsed result + counts
- `monitoring-wrapper-summary.json` — wrapper status + audit report freshness

## CI Behavior

`ci-monitoring.yml` runs only when monitoring assets change (or via manual dispatch), keeping existing pipelines stable.
