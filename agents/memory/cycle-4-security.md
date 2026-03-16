# Cycle 4 Security Hardening Report

**Date:** 2026-03-16  
**Owner:** SECURITY_SHIELD  
**Repository:** `C:\Users\oumba\Desktop\IETCPS\Riada`

---

## 1) Cycle Objective

Apply practical, production-safe security hardening for medium/low findings from the Cycle 3 penetration report, with focus on:

1. Token lifecycle robustness
2. Auth abuse controls
3. Search/filter input bounds
4. GDPR/security SQL audit coverage

---

## 2) Implemented Remediations

### A. Token lifecycle hardening

**Files changed**
- `src/Riada.API/Security/JwtTokenService.cs`
- `src/Riada.API/Controllers/AuthController.cs`
- `src/Riada.API/Program.cs`
- `tests/Riada.UnitTests/Security/JwtSecurityTests.cs`

**Changes delivered**
- Added explicit token revocation API path via `POST /api/auth/logout`.
- Added token service capabilities:
  - `RevokeToken(...)`
  - `IsTokenRevoked(...)`
  - `GetUserId(...)`
- Switched refresh rotation revocation from raw-token HashSet behavior to JTI-based revocation.
- Persisted revoked JTIs to a local persistent store (`JwtTokenService` revocation file path resolution).
- Enforced revocation during bearer authentication with `JwtBearerEvents.OnTokenValidated`.
- Strengthened refresh token validation:
  - token type check (`typ == refresh_token`)
  - revoked-JTI rejection
- Preserved role claims across refresh token rotation.

### B. Auth abuse controls (per-user hardening)

**Files changed**
- `src/Riada.API/Security/AuthAbuseProtectionService.cs` (new)
- `src/Riada.API/Controllers/AuthController.cs`
- `src/Riada.API/appsettings.json`

**Changes delivered**
- Added per-user auth throttling service with safe defaults:
  - Token generation: `3/min` per normalized user key
  - Refresh: `6/min` per normalized token subject
- Wired throttling in `AuthController` for:
  - `POST /api/auth/token`
  - `POST /api/auth/refresh`
- Added `Retry-After` header on HTTP `429` responses.
- Added periodic in-memory counter cleanup to prevent unbounded key growth.

### C. Search/filter and paging bound validation

**Files changed**
- `src/Riada.API/Controllers/MembersController.cs`
- `src/Riada.API/Controllers/GuestsController.cs`
- `src/Riada.API/Controllers/AnalyticsController.cs`
- `src/Riada.API/Controllers/CoursesController.cs`
- `src/Riada.API/Controllers/EquipmentController.cs`
- `src/Riada.Application/UseCases/Members/ListMembersUseCase.cs`
- `src/Riada.Application/UseCases/Guests/ListGuestsUseCase.cs`
- `src/Riada.Application/UseCases/Analytics/GetMemberRiskScoresUseCase.cs`
- `src/Riada.Application/UseCases/Analytics/GetClubFrequencyReportUseCase.cs`
- `src/Riada.Application/UseCases/Courses/GetUpcomingSessionsUseCase.cs`
- `src/Riada.Application/UseCases/Equipment/ListEquipmentUseCase.cs`
- `tests/Riada.UnitTests/UseCases/Guests/ListGuestsUseCaseTests.cs`

**Changes delivered**
- Added controller-level query annotations (`[Range]`, `[StringLength]`) on exposed filters/pagination.
- Added strict parsing for enum-like filters (e.g., members/equipment status) with controlled `400` responses.
- Added use-case guardrails for:
  - page/pageSize bounds
  - max search length
  - analytics limit bounds
  - date range ordering and max span
  - session lookahead day window

---

## 3) SQL GDPR + Security Audit (Requested Scope)

### Audited files
- `sql/03_Triggers.sql`
- `sql/07_Security.sql`

### Implemented hardening in SQL scripts

1. **GDPR deletion guard trigger added**
   - `trg_before_member_delete_gdpr_guard` in `sql/03_Triggers.sql`
   - Blocks direct member deletion unless:
     - member already anonymized
     - `audit_gdpr` evidence exists

2. **Security account posture strengthened**
   - `sql/07_Security.sql` updated with:
     - `REQUIRE SSL` on service users
     - `FAILED_LOGIN_ATTEMPTS 5 PASSWORD_LOCK_TIME 2` on service users

### Gaps identified (documented for next cycle)

1. **No retention guard/automation trigger for access logs**
   - `trg_after_access_granted` updates member visit counters on insert, but there is no retention enforcement logic for `access_log` / `guest_access_log` aging in trigger scope.

2. **Revocation/rate-limit state is not yet distributed**
   - Backend now persists revocation locally, but clustered deployments still need centralized revocation and throttle storage to avoid node drift.

3. **Frontend token storage strategy remains open**
   - HttpOnly cookie migration is still pending (architecture-level frontend/backend coordination item).

---

## 4) Validation

Command executed:

```powershell
dotnet test Riada.sln --nologo
```

Result:
- ✅ Passed
- Unit tests: **79/79**
- Integration tests assembly present (no discovered integration test cases in current baseline)

---

## 5) Residual Risk Summary

- **Reduced:** token revocation abuse window, missing logout flow, per-user auth abuse gap, oversized query-input exposure.
- **Remaining:** distributed revocation consistency, frontend HttpOnly token storage migration, and broader SQL retention policy automation.

