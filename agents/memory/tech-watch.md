# 📡 Tech Watch — Dependencies & Breaking Changes

Monitoring of NuGet and npm packages for updates, security vulnerabilities, and breaking changes relevant to Riada.

---

## Session 1 Initial Scan (2026-03-16)

### Backend (.NET Core 8)

#### Key Packages to Monitor
- **Pomelo.EntityFrameworkCore.MySql** — Current: 8.0.2 | Latest: 8.0.2+ (watch for MySQL-specific breaking changes)
  - NEXT: Check for nullable enum handling improvements
- **FluentValidation** — Current: 11.x | Latest: 12.x+ (major version available)
  - BREAKING: Namespace changes, validation async behavior
- **Dapper** — Current: 2.x | Latest: 2.x stable (rarely breaks)
- **JWT Bearer** — Current: 7.x | Latest: 7.x stable

#### Vulnerability Check
```bash
dotnet list package --vulnerable
# (run before each cycle to catch CVEs)
```

---

### Frontend (Node 24+, Angular 19)

#### Key Packages to Monitor
- **Angular** — Current: 19.2 | Latest: 19.x (watch for patch/minor updates, major updates rare during LTS)
- **RxJS** — Current: 7.x | Latest: 7.x stable
- **SCSS/Bootstrap** — No external CSS framework (custom design system only)
- **TypeScript** — Current: 5.x | Latest: 5.x stable

#### Vulnerability Check
```bash
cd frontend && npm outdated
cd frontend && npm audit
# (run before each cycle)
```

---

## Session 1 Baseline

No vulnerabilities detected in initial scan.
Next scan: Before Cycle 2 (Backend refactor)

---
