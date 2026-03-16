# 🔧 CYCLE 4 BRIEF — Database Optimization & Security Hardening

**Date:** 2026-03-16  
**Status:** Launch-ready  
**Goal:** Strengthen database reliability/performance and close medium security findings from Cycle 3.

---

## Context from Cycle 3

- Penetration audit completed on 33 endpoints.
- Findings: 0 critical, 0 high, 3 medium, 2 low.
- Frontend/backend validation is green (`npm` + `dotnet test`).

Cycle 4 focuses on durable hardening and operational visibility.

---

## Agent Missions (Parallel)

### 1) DATABASE_MASTER
**Scope**
- Audit all triggers in `sql/03_Triggers.sql` (28 triggers).
- Identify trigger bottlenecks, locking risks, and data-integrity edge cases.
- Validate index strategy in `sql/06_Indexes.sql` and `sql/07_Cycle2_Indexes.sql`.
- Produce SQL hardening/monitoring scripts in `sql/`.

**Deliverables**
- Trigger audit report with risk matrix.
- SQL patch script(s) for safe trigger/index improvements (idempotent).
- Monitoring queries for trigger errors, heavy tables, and index health.

---

### 2) SECURITY_SHIELD
**Scope**
- Use `docs/security/SECURITY_PENETRATION_TEST_REPORT.md` and `penetration_findings` to implement actionable remediations.
- Prioritize medium findings:
  - revocation persistence strategy
  - per-user rate limiting strategy
  - JWT storage migration plan (HttpOnly-oriented)
- Review GDPR-relevant SQL logic (`sql/03_Triggers.sql`, `sql/07_Security.sql`).

**Deliverables**
- Security hardening implementation/patches where feasible this cycle.
- Documented roadmap for remaining items requiring infrastructure changes (e.g., Redis).
- Updated security decisions in `agents/memory/decisions.md`.

---

### 3) DEVOPS_COMMANDER
**Scope**
- Add practical monitoring hooks for DB/security health.
- Provide CI-friendly checks for trigger/index/security regressions.
- Ensure new checks can run without breaking current pipelines.

**Deliverables**
- Monitoring script(s)/queries and usage notes.
- CI integration touchpoints (if lightweight and safe).
- Operational checklist for post-deploy verification.

---

## Success Criteria

- Trigger/index audit complete with concrete SQL outputs.
- Medium security findings have implementation progress and explicit closure plan.
- Monitoring assets available for DB and security signals.
- No regressions: `dotnet test Riada.sln` and frontend validation remain green.

---

## Logging & Memory Requirements

- Each agent must append key decisions to `agents/memory/decisions.md`.
- Consolidation output expected:
  - `agents/memory/cycle-4-audit.md`
  - `agents/CYCLE-4-COMPLETE.md`


