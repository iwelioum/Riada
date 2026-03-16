# 🎯 Patterns Library

Extracted patterns that can be reused across cycles. Each pattern is discovered after 3+ similar decisions in the same domain.

---

## PATTERN: Clean Architecture Layer Isolation

**QUAND:** Adding new features requires understanding which layer owns business logic vs. data access vs. HTTP concerns

**FAIRE:**
1. Use cases (Application) — NEVER reference Infrastructure
2. Domain models — NEVER use EF attributes or DbContext
3. DTOs in Application — map domain to HTTP via controllers
4. Validators (FluentValidation) — auto-registered, called before UseCase execution
5. Repositories (Infrastructure) — implement IRepository interfaces

**VÉRIFIER:**
```bash
# Check for Infrastructure references in Application
grep -r "Infrastructure\|DbContext\|IDbConnection" src/Riada.Application/

# Check for controller logic (should be thin)
dotnet test tests/Riada.UnitTests --filter "Controller"
```

**EXEMPLE:** `src/Riada.Application/UseCases/Members/CreateMemberUseCase.cs` — uses only IMemberRepository, never touches DbContext

---

## PATTERN: Enum Conversion Centralization

**QUAND:** Mapping database enum values (snake_case) to C# enums

**FAIRE:**
1. Store all enum converters in `Infrastructure/Persistence/EnumConverters.cs`
2. Use ValueConverter in EF config (not scattered in entity configs)
3. Map: DB snake_case ↔ C# PascalCase
4. Example: "active" (MySQL) ↔ `MemberStatus.Active` (C#)

**VÉRIFIER:**
```bash
# Ensure no ad-hoc conversions in entity configs
grep -r "HasConversion" src/Riada.Infrastructure/Persistence/ | wc -l
# Should only match in EnumConverters.cs
```

**EXEMPLE:** `Infrastructure/Persistence/EnumConverters.cs` — single source of truth for all enum mappings

---

## PATTERN: Stored Procedure Access via Dapper

**QUAND:** Complex queries with OUT parameters or high-performance requirements

**FAIRE:**
1. Define stored procedure in `sql/04_Procedures.sql`
2. Create service in `Infrastructure/StoredProcedures/{DomainService}.cs`
3. Use Dapper: `connection.ExecuteAsync("usp_name", parameters, commandType: CommandType.StoredProcedure)`
4. Always handle OUT parameters properly
5. Document parameter order (MySQL OUT parameters are positional)

**VÉRIFIER:**
```bash
# Test stored procedure execution
dotnet test tests/Riada.IntegrationTests --filter "StoredProcedure"

# Check parameter mapping
grep -A 10 "DynamicParameters" src/Riada.Infrastructure/StoredProcedures/
```

**ESEMPIO:** `Infrastructure/StoredProcedures/BillingService.cs` — `RecordPaymentAsync()` calls `usp_record_payment` with OUT `@p_new_invoice_status`

---

## PATTERN: Angular API Gateway with Casing Normalization

**QUAND:** Angular components need backend data with consistent camelCase naming

**FARE:**
1. All HTTP calls through `ApiService` (single integration point)
2. Service converts PascalCase (backend) → camelCase (frontend)
3. Use typed DTOs/interfaces (avoid `any`)
4. Handle errors with centralized logging

**VÉRIFICAR:**
```bash
cd frontend && npm test -- --watch=false --include "core/services/api.service.spec.ts"
```

**EJEMPLO:** `frontend/src/app/core/services/api.service.ts` — all GET/POST/PUT/DELETE go through here, casing normalized

---
