# Copilot instructions for this repository

## Build, test, and run commands

### Backend (.NET 8)

- Restore: `dotnet restore Riada.sln`
- Build: `dotnet build Riada.sln --no-restore`
- Run API: `dotnet run --project src\Riada.API\Riada.API.csproj`
- Run all tests: `dotnet test Riada.sln --verbosity minimal`
- Run unit tests only: `dotnet test tests\Riada.UnitTests\Riada.UnitTests.csproj`
- Run a single test:
  - `dotnet test tests\Riada.UnitTests\Riada.UnitTests.csproj --filter "FullyQualifiedName~CreateMemberUseCaseTests.ExecuteAsync_ShouldCreateMember_WhenRequestIsValid"`

### Frontend (Angular 19)

- Install deps: `cd frontend && npm install`
- Build: `npm run build`
- Serve built app (Node 24+ flow): `npm run serve:dist`
- Run frontend tests: `npm test -- --watch=false --browsers=ChromeHeadless`
- Run a single frontend spec:
  - `npm test -- --watch=false --browsers=ChromeHeadless --include src/app/app.component.spec.ts`

### Launch automation

- Fullstack (backend + frontend): `cd scripts\Launch && .\launch.ps1 fullstack`
- Backend test workflow: `cd scripts\Launch && .\launch.ps1 test-only`

### Lint

- No dedicated lint command is currently configured in root `.NET` or `frontend/package.json`.

## High-level architecture

- The backend follows strict Clean Architecture by project references:
  - `Riada.API` -> `Riada.Application` and `Riada.Infrastructure`
  - `Riada.Application` -> `Riada.Domain`
  - `Riada.Infrastructure` -> `Riada.Domain`
  - `Riada.Domain` has no project dependencies.
- `Riada.API` wires auth, authorization policies, CORS, Swagger, health checks, exception middleware, and hosted jobs (`ExpireContractsJob`, `ExpireInvoicesJob`).
- `Riada.Application` is use-case centric:
  - DI registers use cases explicitly (`AddScoped<...UseCase>()`)
  - validators are auto-registered via `AddValidatorsFromAssembly(...)`.
- `Riada.Infrastructure` splits data access in two paths:
  - EF Core repositories + `RiadaDbContext` for entity CRUD
  - Dapper stored-procedure services for business-critical procedures (`AccessCheckService`, `BillingService`, `ContractLifecycleService`, `GdprService`, `AnalyticsService`).
- Frontend is Angular 19 standalone. `frontend/src/app/core/services/api.service.ts` is the integration gateway and normalizes API DTO casing (`camelCase`/`PascalCase`) before components consume data.

## Key repository conventions

- Treat the SQL scripts as source-of-truth for schema/business rules (`sql/01...10`). Use database-first workflow (no EF migration-driven schema evolution in normal feature work).
- Stored procedures with OUT parameters are handled via Dapper services in `src\Riada.Infrastructure\StoredProcedures\`.
- Keep enum mapping centralized in `EnumConverters` (`snake_case` MySQL values <-> C# enums). Do not duplicate enum-string conversions ad hoc.
- MySQL generated columns (for invoices/lines totals) are read-only from EF and must stay configured with `ValueGeneratedOnAddOrUpdate()`.
- Authorization is policy-based (`GateAccess`, `BillingOps`, `DataProtection`) and tied to role names (`portique`, `billing`, `dpo`, `admin`).
- Development-only auth bypass exists in `Program.cs` to inject a local principal when unauthenticated; preserve this behavior for local workflows only.
- For frontend local run on Node 24+, prefer `build + serve:dist` (with auto free-port selection) over `ng serve`.

