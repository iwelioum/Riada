## [2026-03-16] ARCHITECT — System Design Audit

### CLEAN ARCHITECTURE ADHERENCE

✅ **Domain Layer (Riada.Domain)** — ZERO dependencies confirmed
- No NuGet packages in .csproj
- Pure domain entities, enums, exceptions, and interfaces
- Excellent isolation

✅ **Application Layer (Riada.Application)** — NO Infrastructure references
- References only Domain
- NuGet dependencies: AutoMapper, FluentValidation, Microsoft.Extensions (abstractions only), Dapper, MySqlConnector
- **⚠️ ISSUE**: Dapper + MySqlConnector should be in Infrastructure, not Application
- UseCases follow single-responsibility pattern (e.g., GetMemberDetailUseCase, CreateMemberUseCase)

✅ **Infrastructure Layer (Riada.Infrastructure)** — NO Application references
- References only Domain
- Contains: EF Core + Pomelo, Dapper, MySqlConnector, Repositories, StoredProcedures
- Clean separation of concerns

✅ **API Layer (Riada.API)** — Wires Application + Infrastructure
- References both Application and Infrastructure (correct pattern)
- **🚨 CRITICAL ISSUE**: `SubscriptionPlansController.cs` directly references `RiadaDbContext` from Infrastructure
- Violates Clean Architecture — should use UseCase pattern instead

---

## FINDINGS

- **Finding 1**: Dapper + MySqlConnector in Application layer — should be Infrastructure-only dependencies
- **Finding 2**: SubscriptionPlansController bypasses Application layer, directly queries RiadaDbContext (architectural violation)
- **Finding 3**: GetMemberRiskScoresUseCase instantiated directly in Program.cs with connection string (special case, not scalable)
- **Finding 4**: CacheService interface defined but not integrated into DI container; caching layer unused
- **Finding 5**: Caching strategy exists (DistributedCacheService, SmartCacheInvalidation) but NO integration in Application or Infrastructure
- **Finding 6**: Stored Procedure services bypass Application layer — called directly from Controllers via raw Dapper
- **Finding 7**: Repository pattern used consistently; good abstraction with IRepository interfaces
- **Finding 8**: Event system (IMemberEventDispatcher, MemberEventDispatcher) exists but limited adoption (only in CreateMemberUseCase)
- **Finding 9**: UnitOfWork pattern implemented correctly; transactions properly managed
- **Finding 10**: Logging configured via Serilog middleware; good error handling in GlobalExceptionHandler
- **Finding 11**: No circular dependencies detected (verified via grep analysis)
- **Finding 12**: Health checks configured; CORS policy implemented for localhost only
- **Finding 13**: Frontend (Angular 19) properly isolated; no backend coupling
- **Finding 14**: Test structure exists (Unit + Integration); coverage appears basic but reasonable

---

## QUICK WINS (fixable in 1-2 days, high impact)

- **Win 1**: Move Dapper + MySqlConnector from Application.csproj to Infrastructure.csproj
  - Impact: Removes layer violation immediately
  - Effort: ~30 min (dependency update)
  - Risk: Very low (infrastructure concern, no API changes)

- **Win 2**: Convert SubscriptionPlansController to use UseCase pattern
  - Create GetSubscriptionPlansUseCase
  - Impact: Restores Clean Architecture compliance
  - Effort: ~1 hour (new UseCase + DI registration)
  - Risk: Low (Controller pattern already established)

- **Win 3**: Integrate CacheService into DI container + wire to repositories
  - Register DistributedCacheService in DependencyInjection.cs
  - Apply to frequently-queried entities (Members, Contracts, Plans)
  - Impact: Immediate caching benefit for read-heavy queries
  - Effort: ~2 hours (DI setup + decorate repositories)
  - Risk: Low (abstraction already exists, backward compatible)

- **Win 4**: Normalize stored procedure pattern — wrap Dapper calls in Application layer
  - Example: Create GetClubFrequencyUseCase(IAnalyticsService) instead of controller calling service directly
  - Impact: UseCases become single entry point for all business logic
  - Effort: ~3-4 hours (2-3 UseCases)
  - Risk: Low (refactor, no behavior changes)

---

## MEDIUM LIFTS (2-3 days, important)

- **Lift 1**: Extend event system adoption beyond CreateMemberUseCase
  - Publish events from: UpdateMemberUseCase, CreateContractUseCase, GenerateMonthlyInvoiceUseCase, etc.
  - Wire up subscribers in MemberLifecycleSubscriber and create domain event handlers
  - Impact: Better domain event traceability, audit logging, integration hooks
  - Effort: ~6-8 hours (design events, implement handlers)
  - Risk: Medium (new event stream, need testing)

- **Lift 2**: Implement proper cache invalidation strategy
  - Integrate SmartCacheInvalidation into all repository mutations (Create, Update, Delete)
  - Register entity relationships in _relationshipMap
  - Impact: Prevents stale cache issues, reduces bugs
  - Effort: ~4-5 hours (identify relationships, hook invalidation)
  - Risk: Medium (if missed, cache consistency issues)

- **Lift 3**: Standardize logging across UseCases and Repositories
  - Currently only GlobalExceptionHandler + Serilog middleware
  - Add structured logging (request entry/exit, key decisions) via ILogger<T>
  - Impact: Better observability, easier debugging in production
  - Effort: ~3-4 hours (log injection, key points)
  - Risk: Low (non-breaking, informational)

- **Lift 4**: Extract health check queries into dedicated UseCase
  - Currently RunSystemHealthCheckUseCase exists but no infrastructure checks
  - Add DB connection, cache connectivity, third-party API status
  - Impact: Comprehensive system health visibility
  - Effort: ~2-3 hours (new service integration)
  - Risk: Low (isolated health check logic)

---

## TECHNICAL DEBT (defer for now)

- **Debt 1**: Pomelo versioning (8.0.2) aligns with .NET 8 but MySQL 8.0+ required check
  - Low priority: Works, but document minimum DB version

- **Debt 2**: Specification pattern not fully adopted
  - Repository uses manual predicate expressions; could migrate to ISpecification<T>
  - Deferred: Works well enough for current domain complexity

- **Debt 3**: MediatR/CQRS pattern not implemented
  - Clean Architecture achievable without it at current scale
  - Revisit when: UseCase count > 50 or cross-domain coordination needed

- **Debt 4**: Feature flags / configuration management
  - All settings in appsettings.json; no runtime toggles
  - Deferred: Not needed until feature release complexity grows

- **Debt 5**: Frontend API integration could use OpenAPI/Swagger client generation
  - Currently manual DTO typing in TypeScript
  - Deferred: Low ROI vs. current maintenance burden

---

## RISKS IDENTIFIED

- **Risk 1**: SubscriptionPlansController directly accesses RiadaDbContext
  - Consequence: Bypasses validation, logging, authorization layers; inconsistent with other endpoints
  - Mitigation: Create GetSubscriptionPlansUseCase immediately (WIN 2); implement code review rule

- **Risk 2**: Dapper + MySqlConnector in Application layer creates circular dependency risk
  - Consequence: Tests cannot reference Application without MySQL libraries; violates DDD
  - Mitigation: Move to Infrastructure.csproj (WIN 1); audit all layer imports quarterly

- **Risk 3**: CacheService not wired; cached queries unknown to developers
  - Consequence: No cache invalidation strategy = stale data bugs; missed performance wins
  - Mitigation: Implement cache integration (WIN 3 + Lift 2); document cache layers in README

- **Risk 4**: Event system underdeveloped; only 1 event type active
  - Consequence: Audit trail incomplete; domain consistency violations possible
  - Mitigation: Extend event system (Lift 1); add event sourcing tests

- **Risk 5**: Development bypass in Program.cs allows all roles without JWT
  - Consequence: Security policy circumvented in dev; risk of production deployment with bypass
  - Mitigation: Add explicit warning comment; disable by environment variable (current: OK)

- **Risk 6**: Stored procedure services instantiated with raw connection strings
  - Consequence: No retry/timeout/pooling management; connection string duplication
  - Mitigation: Inject DbContext instead; let DbConnection pool manage (Lift 1 related)

- **Risk 7**: No rate limiting or throttling on API endpoints
  - Consequence: Resource exhaustion attacks possible; batch operations unprotected
  - Mitigation: Implement middleware (separate cycle), document SLA

---

## NEXT CYCLE RECOMMENDATIONS

### For GOVERNOR to Approve (Priority Order):

1. **IMMEDIATE (Week 1)**: 
   - WIN 1: Move Dapper + MySqlConnector to Infrastructure (30 min)
   - WIN 2: Convert SubscriptionPlansController to UseCase pattern (1 hour)
   - Rationale: Unblock all other architecture improvements; restore Clean Architecture

2. **HIGH (Week 1-2)**:
   - WIN 3: Wire CacheService into DI + apply to hot queries (2 hours)
   - Lift 2: Implement cache invalidation strategy (4-5 hours)
   - Rationale: Quick performance win; required before scaling to 10k+ members

3. **IMPORTANT (Week 2-3)**:
   - WIN 4: Normalize stored procedure pattern (3-4 hours)
   - Lift 1: Extend event system + add audit logging (6-8 hours)
   - Rationale: Prevents technical debt accumulation; enables audit compliance

4. **NICE-TO-HAVE (Week 3)**:
   - Lift 3: Standardize logging (3-4 hours)
   - Lift 4: Enhanced health checks (2-3 hours)

### Architecture Score (Current):
- **Clean Architecture Compliance**: 8/10 (minor layer violation in API)
- **Scalability Readiness**: 6/10 (missing caching integration, logging coverage)
- **Test Coverage**: 5/10 (basic unit tests, need more integration tests)
- **Observability**: 6/10 (Serilog + health checks exist, need more instrumentation)

### Handoff Notes for GOVERNOR:
- No blocking issues; system is operationally sound
- Recommended delivery: 6 high-impact improvements across 3 weeks
- Team should focus on Cache Integration + StoredProcedure Normalization in parallel
- Post-improvements, recommend: DDD event sourcing deep-dive, CQRS evaluation for analytics layer

---

**Audit Completed**: [2026-03-16]
**Auditor**: ARCHITECT
**Next Phase**: GOVERNOR consolidates all agent audits → prioritization for implementation
