# Copilot Instructions for Riada

A fullstack fitness management system: ASP.NET Core 8 Clean Architecture backend + Angular 19 frontend, with MySQL 8 database.

## Build, Test, and Run Commands

### Backend (ASP.NET Core 8)

**Restore & Build:**
```bash
dotnet restore Riada.sln
dotnet build Riada.sln --no-restore
```

**Run API:**
```bash
dotnet run --project src\Riada.API\Riada.API.csproj
# Swagger: https://localhost:7001/swagger
```

**Run Tests:**
```bash
# Full test suite
dotnet test Riada.sln --verbosity minimal

# Unit tests only
dotnet test tests\Riada.UnitTests\Riada.UnitTests.csproj

# Single test
dotnet test tests\Riada.UnitTests\Riada.UnitTests.csproj --filter "FullyQualifiedName~CreateMemberUseCaseTests.ExecuteAsync_ShouldCreateMember_WhenRequestIsValid"
```

### Frontend (Angular 19)

**Install & Build:**
```bash
cd frontend
npm install
npm run build
```

**Run Frontend:**
```bash
# Preferred: serve dist with auto free-port selection (Node 24+ compatible)
npm run serve:dist

# Alternative: dev mode (less preferred for local work)
ng serve --port 4200
```

**Run Frontend Tests:**
```bash
# Full test suite
npm test -- --watch=false --browsers=ChromeHeadless

# Single test file
npm test -- --watch=false --browsers=ChromeHeadless --include "src/app/app.component.spec.ts"
```

### Fullstack Launch

```bash
# Windows: backend + frontend dist
cd scripts\Launch
.\launch.ps1 fullstack

# Mac/Linux
cd scripts/Launch && ./launch.sh run
```

### Lint

No dedicated lint command configured. Use IDE/editor warnings.

---

## High-Level Architecture

### Backend: Clean Architecture (Strict Dependency Flow)

```
Riada.Domain (no dependencies)
    ↑
    |--- Riada.Application (depends on Domain)
    |
Riada.Infrastructure (depends on Domain, no Application)
    ↑
    |--- Riada.API (depends on Application, Infrastructure)
```

**Riada.Domain** (zero dependencies)
- 21 entities organized by domain aggregate (ClubManagement, Membership, Billing, AccessControl, CourseScheduling, Compliance)
- 18 enums mapping MySQL column values (Gender, MemberStatus, ContractStatus, etc.)
- Repository interfaces (IMemberRepository, IContractRepository, etc.)

**Riada.Application** (use-case centric)
- ~40 UseCases (plain classes, one per business operation)
- FluentValidation validators auto-registered via `AddValidatorsFromAssembly()`
- DTOs as C# records
- No Infrastructure knowledge

**Riada.Infrastructure** (data access split)
- **EF Core path:** `RiadaDbContext` + generic + specific repositories for entity CRUD
- **Dapper path:** `StoredProcedureServices` (AccessCheckService, BillingService, ContractLifecycleService, GdprService, AnalyticsService) for business-critical operations using MySQL stored procedures
- Enum converters centralized in `EnumConverters` (snake_case ↔ C# enums)

**Riada.API** (wiring & controllers)
- Controllers map HTTP → UseCases
- Auth/Auth policies (GateAccess, BillingOps, DataProtection, tied to roles: portique, billing, dpo, admin)
- CORS, Swagger, health checks, exception middleware
- Background jobs: `ExpireContractsJob`, `ExpireInvoicesJob`
- Development-only auth bypass for local testing

### Frontend: Angular 19 Standalone

```
src/app/
├── core/
│   ├── services/api.service.ts          (HTTP gateway, DTO ↔ component casing normalization)
│   ├── models/                          (Typed interfaces for API responses)
│   └── ...
├── layout/
│   ├── header/
│   └── sidebar/
├── pages/
│   ├── dashboard/
│   ├── members/                         (CRUD + contracts, freeze/renew)
│   ├── courses/                         (Sessions, bookings)
│   ├── billing/                         (Invoices, payments, generation)
│   ├── equipment/                       (Club/status filters, maintenance tickets)
│   ├── access-control/
│   ├── plans/
│   ├── guests/
│   ├── analytics/
│   └── [demo pages: exercises, meal-plan, workout, messages, reports, settings]
└── styles.scss                          (Global design system: colors, breakpoints, card/table components)
```

**Key Patterns:**
- All HTTP calls through `ApiService` (single integration point)
- RxJS subscriptions in components with error handling
- Responsive SCSS with mobile-first breakpoints
- Lazy-loaded routes

---

## Key Repository Conventions

### Database & Schema

1. **Source of Truth:** SQL scripts (`sql/01...10`) define schema + business rules
   - `01_Create_Database.sql` — schema
   - `03_Triggers.sql` — 28 triggers (enforce constraints, audit, cascade updates)
   - `04_Procedures.sql` — 8 stored procedures (complex queries, Dapper integration)
   - `sql/` is **database-first** (no EF migrations)

2. **MySQL Generated Columns** (read-only in EF)
   - Invoices: `vat_amount`, `amount_incl_tax`, `balance_due`
   - InvoiceLines: `line_amount_excl_tax`, `line_amount_incl_tax`
   - Must be configured in EF with `.HasComputedColumnSql()` and `.ValueGeneratedOnAddOrUpdate()`

3. **Stored Procedures with OUT Parameters**
   - Handled via Dapper services in `Infrastructure/StoredProcedures/`
   - Example: `AccessCheckService.CheckAccessAsync()`, `BillingService.RecordPaymentAsync()`
   - SQL logic stays in SQL, C# calls via `IDbConnection.QueryAsync()`

### Code Patterns

**UseCase Pattern** (Application layer)
```csharp
public class CreateMemberUseCase
{
    private readonly IMemberRepository _repo;
    public CreateMemberUseCase(IMemberRepository repo) => _repo = repo;
    
    public async Task<MemberResponseDto> ExecuteAsync(CreateMemberRequest req, CancellationToken ct = default)
    {
        // Validation happens BEFORE this via FluentValidation
        var member = new Member { ... };
        _repo.Add(member);
        await _repo.SaveChangesAsync(ct);
        return new MemberResponseDto(member);
    }
}
```
- No validation logic in UseCase (FluentValidation validators registered in DI)
- Constructor injection only
- Single public method: `ExecuteAsync(Request, CancellationToken)`
- Always return DTO

**Repository Pattern** (Infrastructure layer)
```csharp
public interface IMemberRepository : IGenericRepository<Member>
{
    Task<List<Member>> GetByStatusAsync(MemberStatus status, CancellationToken ct);
}

public class MemberRepository : GenericRepository<Member>, IMemberRepository
{
    public async Task<List<Member>> GetByStatusAsync(MemberStatus status, CancellationToken ct)
        => await _context.Members.Where(m => m.Status == status).ToListAsync(ct);
}
```
- Generic repository for CRUD (Add, Update, Delete, SaveChangesAsync)
- Specific repository for domain queries
- Always accept `CancellationToken ct`

**Enum Conversion** (Infrastructure)
- Centralized in `EnumConverters` class (not ad hoc in entity configs)
- Maps snake_case MySQL values ↔ C# enums
- Example: "active" (DB) ↔ `MemberStatus.Active` (C#)

**Authorization** (Policy-based, tied to roles)
- `[Authorize(Policy = "GateAccess")]` for access control
- `[Authorize(Policy = "BillingOps")]` for invoicing
- `[Authorize(Policy = "DataProtection")]` for GDPR
- Roles: `portique`, `billing`, `dpo`, `admin`
- Development bypass in `Program.cs` (inject local principal if no token)

### Frontend Patterns

**API Service Gateway** (`core/services/api.service.ts`)
```typescript
constructor(private http: HttpClient) {}

getMembers(): Observable<Member[]> {
  return this.http.get<Member[]>('/api/members');
}
```
- Single integration point for all backend calls
- Handles DTO casing normalization (PascalCase DB → camelCase components)
- Typed responses via interfaces in `core/models/`

**Component with API** (example)
```typescript
export class MembersPage implements OnInit {
  members: Member[] = [];
  
  constructor(private api: ApiService) {}
  
  ngOnInit() {
    this.api.getMembers().subscribe(
      data => this.members = data,
      error => console.error(error)
    );
  }
}
```
- Constructor inject `ApiService`
- Subscribe pattern (no unsubscribe needed if Observable completes)
- Handle errors

**SCSS Design System** (`styles.scss`)
```scss
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
}

// Responsive breakpoints
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;

.card { ... }
.btn { ... }
```

---

## Specific Implementation Notes

### Backend Features

**Triggers to Know:**
- `trg_before_member_insert_age` — enforces member age ≥ 16
- `trg_before_booking_insert_policy` — validates booking policy
- `trg_before_booking_insert_cap` — enforces session capacity
- `trg_after_payment_insert` — auto-updates invoice status when payment recorded
- `trg_after_booking_insert/update` — updates enrolled_count on ClassSession

**Background Jobs:**
- `ExpireContractsJob` — marks contracts as expired (runs on schedule)
- `ExpireInvoicesJob` — marks invoices as overdue (runs on schedule)
- Configured in `Program.cs` via `AddHostedService<TJob>()`

**Analytics** (Dapper only, not EF)
- `GetClubFrequencyReportUseCase` — 30-day attendance by club
- `GetOptionPopularityUseCase` — most subscribed options
- `RunSystemHealthCheckUseCase` — data integrity checks
- Queries defined in `08_Select_Queries.sql`, `10_System_Check.sql`

### Frontend Features

**API Integration Points:**
- Members: `getMembers()`, `getMemberDetail()`, `createMember()`, `updateMember()`, `anonymizeMember()`
- Courses: `getUpcomingSessions()`, `bookSession()`, `cancelBooking()`
- Billing: `getInvoiceDetail()`, `recordPayment()`, `generateMonthlyInvoice()`
- Equipment: `listEquipment()`, `createMaintenanceTicket()`, `updateMaintenanceStatus()`
- Access/Analytics/Clubs/Plans/Guests helpers

**Development Server:**
- Prefers `npm run serve:dist` (production bundle served via http-server)
- Automatically picks free port starting at 4200
- Backend has CORS enabled for `http://localhost:*` in Development

**Environment Config:**
- `frontend/src/environments/environment.ts` (development)
- `frontend/src/environments/environment.production.ts` (production)
- Both define `apiUrl: string` to point to backend

---

## MCP Servers (Optional Integrations)

For enhanced Copilot capabilities in this project, consider configuring:

**Filesystem MCP** — Browse project structure, search files
- Useful for exploring unfamiliar domains or finding related files

**GitHub MCP** — Access repository issues, PRs, commits
- Track related work, reference existing decisions

**Playwright MCP** — Automated frontend testing/debugging
- Test Angular components in browser context
- Visual regression detection for responsive design

**SQLite MCP** — Direct database query results
- Debug stored procedures and triggers (if running tests against SQLite replica)

**Shell MCP** — Execute build/test commands
- Run `dotnet build`, `npm test` inline during work

---

## Troubleshooting

**Backend build fails:**
1. Check MySQL connection in `appsettings.Development.json`
2. Verify EF context isn't calling migrations (database-first mode)
3. Look for missing `using` statements or circular project references

**Frontend port 4200 in use:**
```bash
ng serve --port 4300
# or just use npm run serve:dist (auto-picks free port)
```

**API CORS errors:**
- Ensure backend has Development environment set
- Frontend `apiUrl` must match backend listening port

**Tests timeout:**
- Add `--timeout 10000` to test command
- Check database connectivity for integration tests

---

## Documentation Index

- **README.md** — Quick start, high-level overview
- **docs/getting-started/QUICK_START.md** — 30-second launch guide
- **docs/DOCUMENTATION_INDEX.md** — Central docs hub
- **docs/architecture/ARCHITECTURE.md** — Detailed schema + design
- **docs/patterns/PATTERN_GUIDE.md** — UseCase + repository patterns
- **docs/operations/AUTOMATION_GUIDE.md** — Script automation reference
- **docs/archive/CLAUDE_CODE_INSTRUCTIONS.md** — Legacy C# backend details
- **frontend/README.md** — Angular setup & integration

---

**Status:** ✅ Production Ready  
**Tech:** ASP.NET Core 8.0 | MySQL 8.0+ | Angular 19 | Clean Architecture
