# Copilot Instructions for Riada

Riada is a fullstack fitness management system with an ASP.NET Core 8 backend, Angular 19 frontend, and MySQL 8 database.

## Build, test, and lint commands

### Backend (.NET 8)

```powershell
# Restore + build
dotnet restore Riada.sln
dotnet build Riada.sln --no-restore

# Run API
dotnet run --project src\Riada.API\Riada.API.csproj

# Tests
dotnet test Riada.sln --verbosity minimal
dotnet test tests\Riada.UnitTests\Riada.UnitTests.csproj
dotnet test tests\Riada.IntegrationTests\Riada.IntegrationTests.csproj

# Single unit test
dotnet test tests\Riada.UnitTests\Riada.UnitTests.csproj --filter "FullyQualifiedName~CreateMemberUseCaseTests.ExecuteAsync_ShouldCreateMember_WhenRequestIsValid"
```

### Frontend (Angular 19)

```powershell
cd frontend
npm install
npm run build

# Preferred local run (serves dist, auto-selects free port from 4200)
npm run serve:dist

# Unit tests (headless)
npm test -- --watch=false --browsers=ChromeHeadless

# Single spec file
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/app.component.spec.ts

# Optional Cypress smoke gate
npm run e2e:smoke
```

### Launch automation scripts

```powershell
cd scripts\Launch
.\launch.ps1 run       # backend only
.\launch.ps1 fullstack # backend + frontend dist
.\launch.ps1 test-only # backend build + unit tests
```

### Lint

There is currently no repository lint command (no `lint` script in `frontend\package.json`, no root lint command). CI (`.github/workflows/ci-angular.yml`) only runs lint if a lint script exists.

## High-level architecture

- Backend uses Clean Architecture with strict project references:
  - `Riada.API` -> `Riada.Application`, `Riada.Infrastructure`
  - `Riada.Application` -> `Riada.Domain`
  - `Riada.Infrastructure` -> `Riada.Domain`
  - `Riada.Domain` has no project dependencies
- `Riada.API\Program.cs` wires the app: layer DI (`AddApplication`, `AddInfrastructure`), JWT auth, policy-based authorization, rate limiting, CORS, Swagger, health checks, exception middleware, and hosted jobs (`ExpireContractsJob`, `ExpireInvoicesJob`).
- `Riada.Application` is use-case centric (`UseCases/*`), with validators auto-registered via `AddValidatorsFromAssembly(...)` in `DependencyInjection.cs`.
- `Riada.Infrastructure` splits persistence:
  - EF Core (`RiadaDbContext` + repositories) for aggregate CRUD/querying
  - Dapper stored-procedure services (`AccessCheckService`, `BillingService`, `ContractLifecycleService`, `GdprService`, `AnalyticsService`) for SQL procedural logic and OUT-parameter workflows
- SQL scripts in `sql\` are first-class architecture artifacts (schema, triggers, procedures, checks).
- Frontend is Angular standalone with lazy-loaded route components (`src/app/app.routes.ts`) and an auth guard.
- `frontend/src/app/core/services/api.service.ts` is the single API gateway and DTO normalization layer used by pages/components.

## Key repository conventions

- Treat `sql\*.sql` as source-of-truth for schema/business rules; this codebase is database-first in normal development flow.
- Use cases follow a consistent entrypoint: `ExecuteAsync(..., CancellationToken)` and are registered explicitly in `Riada.Application\DependencyInjection.cs`.
- Controllers use `[FromServices]` for use case injection and keep orchestration thin (HTTP mapping + status handling).
- Domain defines repository interfaces (`Riada.Domain.Interfaces.Repositories`); Infrastructure implements them. Keep cancellation-token support on async paths.
- Keep enum string mapping centralized in `Riada.Infrastructure\Persistence\Configurations\EnumConverters.cs` (snake_case MySQL values <-> C# enums).
- Invoice and invoice line computed totals are DB-generated; keep EF mapping as generated (`ValueGeneratedOnAddOrUpdate`) and do not treat these as writable fields.
- Authorization is policy + role based. Current policy names are `GateAccess`, `BillingOps`, `DataProtection` with roles `portique`, `billing`, `dpo`, `admin`.
- Frontend API integration should go through `ApiService`; preserve its PascalCase/camelCase compatibility mapping when adding endpoints.
- For local frontend work (especially Node 24+), prefer `npm run build` + `npm run serve:dist` over `ng serve`.
