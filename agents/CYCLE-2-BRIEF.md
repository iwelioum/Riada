# ⚙️ CYCLE 2 BRIEF — Backend + Database Optimization

**Session:** Cycle 2 (Backend Refactoring + Database Optimization)  
**Status:** Ready to Launch  
**Duration Target:** 2-3 days intensive  
**Start Time:** 2026-03-16 04:24 UTC

---

## 🎯 MISSION

Execute **20 hours of prioritized quick wins** to:
1. **Backend:** Fix validator integration (3 issues, 45 min)
2. **Database:** Fix N+1 query + add indexes + pagination (8 hours)
3. **DevOps:** Add GitHub Actions CI/CD workflow (2-3 hours)
4. **Security:** Harden JWT secret, remove dev bypass, configure tokens (2-3 hours)

**Target Outcomes:**
- Backend: 8/10 → **9.5/10**
- Database: 91% → **96%**
- CI/CD: MISSING → **OPERATIONAL**
- Security: 12 vulns → **6 vulns (critical path closed)**

---

## 📋 AGENTS DEPLOYED (4 agents, parallel execution)

| Agent | Task | Effort | Success Criteria |
|-------|------|--------|------------------|
| 🧠 **BACKEND_SAGE** | Fix 3 validator integrations + Dapper optimization | 45 min | 3/3 validators pass validation tests |
| 💾 **DATABASE_MASTER** | Fix N+1 query, add indexes, pagination | 8 hours | Query reduced 99%, page support added |
| 🚀 **DEVOPS_COMMANDER** | Create GitHub Actions CI workflow | 2-3 hours | Build + test runs on PR, passes locally |
| 🔐 **SECURITY_SHIELD** | Fix JWT hardcoding, dev bypass, token expiration | 2-3 hours | 3 critical fixes deployed |
| 🏛️ **GOVERNOR** | Coordinate, consolidate, log decisions | Async | Daily summary log |

---

## 🔧 DETAILED TASKS

### 1️⃣ BACKEND_SAGE — Fix Validator Integration (45 min)

**File:** `agents/02-backend-refactoring-agents.md`

**Quick Wins (from Cycle 1 audit):**
1. Fix `UpdateMemberUseCase` validator (5 min)
   - Location: `src/UseCases/Members/UpdateMemberUseCase.cs`
   - Issue: Validator not wired in DI container
   - Fix: Add registration in `ContainerProvider.cs`

2. Fix `RegisterGuestUseCase` validator (5 min)
   - Location: `src/UseCases/Guests/RegisterGuestUseCase.cs`
   - Issue: Validator not called in UseCase
   - Fix: Inject + call validator before business logic

3. Create `BookSessionValidator` (15 min)
   - Location: New file `src/Validators/BookSessionValidator.cs`
   - Rule: Session cannot be booked if therapist is not available
   - Rule: Guest cannot have concurrent bookings
   - Rule: Sessions must be in valid time slots

4. Create `GenerateMonthlyInvoiceValidator` (15 min)
   - Location: New file `src/Validators/GenerateMonthlyInvoiceValidator.cs`
   - Rule: Only contracts with active sessions in month
   - Rule: Validate rate calculations before invoice generation

5. Optimize Dapper services (5 min)
   - Change `Dapper.SqlMapper` registration from transient → singleton
   - File: `src/Infrastructure/DependencyInjection/ContainerProvider.cs`
   - Impact: 5-10% performance gain

**Success Criteria:**
- ✅ All 3 validator fixes compile + pass unit tests
- ✅ BookSessionValidator + GenerateMonthlyInvoiceValidator exist with tests
- ✅ No regression in existing UseCase functionality
- ✅ Dapper optimized with singleton scope

---

### 2️⃣ DATABASE_MASTER — Fix N+1 Query + Optimize (8 hours)

**File:** `agents/03-database-optimization-agents.md`

**Critical Issue (N+1 Query):**
- **Location:** `ListGuestsUseCase` → `GuestRepository.ListActiveGuests()`
- **Problem:** Loads 1K guests + 1M DB calls (1 per guest for therapist/contract)
- **Current Query:** 
  ```sql
  SELECT * FROM Guests WHERE IsActive = 1
  -- Then N queries: SELECT * FROM Therapists WHERE ID = @therapistId
  -- And N queries: SELECT * FROM Contracts WHERE GuestID = @guestId
  ```
- **Fix:** Use JOIN + GROUP_CONCAT in single query
- **Impact:** **99% reduction** (1M → 3 calls), loads in <100ms instead of 30s

**Tasks (8 hours):**

1. **Fix N+1 Query in ListGuestsUseCase** (1-2 hours)
   - Rewrite `GuestRepository.ListActiveGuests()` with proper JOINs
   - Load therapist + contract data in single query
   - Implement projection to avoid loading entire entities
   - Test with 10K guests, verify query count stays at 1

2. **Add Missing Composite Indexes** (2-3 hours)
   - Index 1: `idx_contracts_guest_active` on `Contracts(GuestID, IsActive)`
   - Index 2: `idx_sessions_therapist_date` on `Sessions(TherapistID, SessionDate)`
   - Index 3: `idx_invoices_contract_month` on `Invoices(ContractID, Month)`
   - Index 4: `idx_guests_active_therapist` on `Guests(IsActive, TherapistID)`
   - Benchmark: Before/after query plans + execution times

3. **Implement Pagination** (2-3 hours)
   - Add `LIMIT` + `OFFSET` to list operations
   - Files: `ListGuestsUseCase`, `ListTherapistsUseCase`, `ListContractsUseCase`
   - Page size: 50 items default
   - Total count returned for pagination UI
   - Test: Verify memory doesn't spike with 100K+ records

4. **Fix Contract Data Cleanup** (30 min)
   - Issue: `freeze_dates` field has dangling references
   - Add foreign key constraint to force data consistency
   - Cleanup old orphaned rows

**Success Criteria:**
- ✅ ListGuests query reduces from 1M calls → 3 calls
- ✅ Query execution time: 30s → <100ms
- ✅ All 4 indexes created + verified in EXPLAIN ANALYZE
- ✅ Pagination implemented on 3 list endpoints
- ✅ Zero performance regressions

---

### 3️⃣ DEVOPS_COMMANDER — Add GitHub Actions CI/CD (2-3 hours)

**File:** `agents/08-devops-infrastructure-agents.md`

**Missing Critical Infrastructure:**
- No automated testing on PR
- No build validation before merge
- Manual deployment steps (error-prone)

**Tasks (2-3 hours):**

1. **Create `.github/workflows/ci-dotnet.yml`** (1 hour)
   - Trigger: On push to `main`, `develop`, and PRs
   - Jobs:
     ```yaml
     - Build backend (.NET 8)
     - Run unit tests (xUnit)
     - Run integration tests
     - Publish code coverage
     - Code quality scan (optional)
     ```
   - Environment: ubuntu-latest with .NET SDK
   - Artifact: Build output for deployment stage

2. **Create `.github/workflows/ci-angular.yml`** (45 min)
   - Trigger: On push + PRs
   - Jobs:
     ```yaml
     - Install dependencies (npm ci)
     - Lint (ng lint)
     - Build production (ng build)
     - Run unit tests (ng test)
     - Run E2E tests (ng e2e)
     ```
   - Environment: Node 18+
   - Artifact: Angular dist/ for deployment

3. **Update docker-compose to use .env** (30 min)
   - Remove hardcoded secrets from `docker-compose.yml`
   - Create `.env.example` with placeholder values
   - Load secrets from GitHub Secrets in CI/CD
   - Document: `.env.template` + setup guide

4. **Add Dockerfile health check** (15 min)
   - Add `HEALTHCHECK` instruction to Dockerfile
   - Endpoint: `GET /health`
   - Interval: 30s, timeout: 10s, retries: 3

**Success Criteria:**
- ✅ CI workflow runs on every PR, passes for good code
- ✅ Build time: <5 min total
- ✅ Secrets not exposed in workflow files
- ✅ Health check endpoint responds on port 8080
- ✅ No manual intervention required for automated testing

---

### 4️⃣ SECURITY_SHIELD — Harden Security (2-3 hours)

**File:** `agents/07-security-division-agents.md`

**Critical Issues Found in Cycle 1:**

| Issue | File | Fix | Time |
|-------|------|-----|------|
| JWT secret hardcoded | `appsettings.json` | Generate random 256-bit secret, store in .env | 30 min |
| Dev bypass grants admin | `AuthMiddleware.cs` | Remove dev token bypass OR require special flag | 1 hour |
| Token expiration not set | `TokenService.cs` | Add 1hr expiration for access + 7d for refresh | 30 min |
| Rate limiting disabled | `Startup.cs` | Wire rate limiting middleware for auth endpoints | 1-2 hours |
| No CORS restrictions | `Startup.cs` | Restrict CORS to known frontend origins | 15 min |

**Tasks (2-3 hours):**

1. **Generate & Secure JWT Secret** (30 min)
   - Generate random 256-bit secret using `System.Security.Cryptography`
   - Store in GitHub Secrets (for CI/CD)
   - Store in `.env` file (local development)
   - Never commit secrets to Git
   - File: `src/Infrastructure/Security/TokenService.cs`

2. **Remove Dev Authentication Bypass** (1 hour)
   - Current: Dev environment bypasses JWT check
   - Fix: Require environment variable flag + special token
   - Option A: Require `ALLOW_DEV_BYPASS=true` AND valid dev token
   - Option B: Remove bypass completely, require valid JWT always
   - Test: Verify UAT/Prod have bypass disabled
   - File: `src/Api/Middleware/AuthenticationMiddleware.cs`

3. **Configure Token Expiration** (30 min)
   - Access token: 1 hour expiration
   - Refresh token: 7 days expiration
   - Implement refresh token rotation (invalidate old token)
   - File: `src/Infrastructure/Security/TokenService.cs`

4. **Wire Rate Limiting** (1-2 hours)
   - Endpoint: `/api/auth/login` — 5 attempts/minute per IP
   - Endpoint: `/api/auth/register` — 3 attempts/hour per IP
   - Endpoint: All other endpoints — 100 requests/minute per user
   - Use: AspNetCoreRateLimit NuGet package
   - Store: Redis (or in-memory if Redis not available)
   - File: `src/Infrastructure/Configuration/RateLimitConfig.cs`

5. **Set Production CORS** (15 min)
   - Dev: Allow `http://localhost:4200`
   - Prod: Allow only `https://yourapp.com`
   - Disable credentials if not HTTPS
   - File: `src/Api/Startup.cs`

**Success Criteria:**
- ✅ JWT secret randomized + no hardcoded values in code
- ✅ Dev bypass removed OR requires special flag
- ✅ Access tokens expire after 1 hour
- ✅ Refresh tokens rotate on use
- ✅ Rate limiting active on auth endpoints
- ✅ CORS restricted to known origins
- ✅ Zero critical security issues remain

---

## 🔗 DEPENDENCIES

| Agent | Depends On | Reason |
|-------|-----------|--------|
| BACKEND_SAGE | — | Can start immediately |
| DATABASE_MASTER | BACKEND_SAGE | Database indexes need code to use them |
| DEVOPS_COMMANDER | BACKEND_SAGE + DATABASE_MASTER | CI needs working build + tests |
| SECURITY_SHIELD | BACKEND_SAGE | Changes to TokenService need code refactoring |

**Execution Strategy:** Run in parallel where possible, combine results:
- Day 1: BACKEND_SAGE + SECURITY_SHIELD (independent)
- Day 1.5: DATABASE_MASTER starts (depends on backend fixes)
- Day 2: DEVOPS_COMMANDER (depends on all code changes)
- Day 2.5: GOVERNOR consolidates all changes + logs decisions

---

## 📊 DELIVERABLES

**By End of Cycle 2:**

1. ✅ **Code Changes**
   - 3 validator fixes (backend)
   - 1 N+1 query fix (database)
   - 4 new indexes (database)
   - 3 pagination implementations (database)
   - 2 GitHub Actions workflows (DevOps)
   - 5 security fixes (security)

2. ✅ **Test Results**
   - All unit tests passing (backend)
   - All integration tests passing (database)
   - GitHub Actions pipeline executing on PR

3. ✅ **Documentation**
   - Updated `agents/memory/decisions.md` with Cycle 2 entry
   - Updated `agents/memory/patterns.md` with extracted patterns
   - Cycle 2 completion report in `agents/memory/cycle-2-audit.md`

4. ✅ **Git Commits**
   - Commit: "backend: fix 3 validator integrations"
   - Commit: "database: fix N+1 query + add indexes + pagination"
   - Commit: "devops: add GitHub Actions CI/CD workflows"
   - Commit: "security: fix JWT hardcoding, dev bypass, token expiration"

---

## 🎯 SUCCESS METRICS

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Backend Score | 8/10 | 9.5/10 | ⏳ |
| Database Score | 91% | 96% | ⏳ |
| N+1 Query | 1M calls | 3 calls | ⏳ |
| Query Latency | 30s | <100ms | ⏳ |
| CI/CD Pipeline | MISSING | OPERATIONAL | ⏳ |
| Security Score | 12 vulns | 6 vulns | ⏳ |
| Quick Wins | 14 items | 10+ resolved | ⏳ |

---

## 🚀 LAUNCH COMMAND

```bash
# Agent 1: Backend Validator Fixes
# Agent 2: Database N+1 + Indexes + Pagination
# Agent 3: DevOps CI/CD Workflows
# Agent 4: Security Hardening
# All running in parallel...
```

**Estimated Total Time:** 12-15 hours combined (2-3 days intensive)

---

## 📌 NOTES

- All agents have full context from `agents/memory/cycle-1-audit.md`
- Each agent updates `decisions.md` after completing their tasks
- GOVERNOR consolidates findings at end of Cycle 2
- Cycle 3 begins when Cycle 2 is complete
- Monitor: `agents/memory/decisions.md` for decision log
- Monitor: Git commits for progress tracking

---

**Status: 🟢 READY TO LAUNCH**

All 4 agents are ready to deploy. They have clear prioritized tasks, success criteria, and interdependencies mapped. Parallel execution will complete in ~12-15 hours combined.

Ready to proceed? 🚀
