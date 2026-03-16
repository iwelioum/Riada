# 🛠️ Error Solutions Reference

Catalog of build errors, runtime issues, and their solutions. Helps agents avoid repeating past mistakes.

---

## Session 1 Baseline (2026-03-16)

### Known Good States
- ✅ Backend: `dotnet build Riada.sln` — 0 errors
- ✅ Frontend: `npm run build` — 0 errors
- ✅ Tests: All unit tests passing
- ✅ API: Swagger available at https://localhost:7001/swagger
- ✅ Frontend dist: Serves at http://localhost:4200+ (auto free port)

---

### Common Issues & Solutions

#### CS8600 — Converting null literal to non-nullable reference type
**CONTEXT:** Nullable reference types enabled in .csproj
**SOLUTION:** Add `?` to type or use `??` for default value
**FILE EXAMPLE:** Check all `.cs` files for uninitialized properties

#### MySQL Connection Timeout
**CONTEXT:** `appsettings.Development.json` has wrong connection string
**SOLUTION:** Verify `Server=localhost;Port=3306;Database=riada_db;User Id=root;Password=...`
**FILE EXAMPLE:** `src/Riada.API/appsettings.Development.json`

#### EF Core Schema Mismatch
**CONTEXT:** Database-first mode but code tries to run migrations
**SOLUTION:** Remove `Database.Migrate()` from `Program.cs`, use database-first workflow only
**FILE EXAMPLE:** `src/Riada.API/Program.cs` — must NOT call migrations

#### Angular Port 4200 Already in Use
**CONTEXT:** Another process using default port
**SOLUTION:** Use `npm run serve:dist` (auto-picks free port) or `ng serve --port 4300`
**FILE EXAMPLE:** N/A (CLI behavior)

#### CORS Errors from Frontend
**CONTEXT:** Frontend on different port/origin than backend
**SOLUTION:** Ensure backend CORS policy includes frontend origin, and Development environment is set
**FILE EXAMPLE:** `src/Riada.API/Program.cs` — CORS configuration section

---

## Session 1 New Discoveries

(Will be updated after Cycle 1 audit)

---
