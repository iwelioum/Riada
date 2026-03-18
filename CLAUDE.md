# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

| Layer | Technology |
|---|---|
| Back-end | ASP.NET Core 8 / C# — Clean Architecture (Domain / Application / Infrastructure / API) |
| Database | MySQL — database `riada_db`, 19 tables, triggers, stored procedures |
| Front-end | Angular 21 (standalone components, no NgModules) + Tailwind CSS 3.4 |
| State | Angular Signals for local UI state |
| Charts | ng-apexcharts |
| Icons | lucide-angular |
| HTTP | Angular `HttpClient` via `provideHttpClient()` |

> **Always use Angular (frontend), ASP.NET C# (backend), MySQL (database). No React, Vue, Node.js, MongoDB.**

---

## Commands

### Frontend (Angular) — run from `frontend/`
```bash
npm start            # ng serve (dev server, default port 4200)
npm run build        # ng build (production)
npm test             # vitest (unit tests)
npm run watch        # ng build --watch --configuration development
```

### Backend (ASP.NET Core) — run from repo root
```bash
dotnet run --project src/Riada.API          # dev server (port 5154 / https 7154)
dotnet build                                 # build solution
dotnet test                                  # run all tests
dotnet test tests/Riada.UnitTests           # unit tests only
dotnet test tests/Riada.IntegrationTests    # integration tests only
```

---

## Project Structure

```
Riada/
├── src/
│   ├── Riada.Domain/          # Entities, value objects, domain interfaces
│   ├── Riada.Application/     # Use cases, DTOs, CQRS handlers
│   ├── Riada.Infrastructure/  # EF Core / MySQL, repositories, external services
│   └── Riada.API/
│       ├── Controllers/       # REST endpoints (one controller per domain)
│       └── Program.cs         # DI, middleware, CORS, JWT configuration
├── tests/
│   ├── Riada.UnitTests/
│   └── Riada.IntegrationTests/
└── frontend/
    └── src/app/
        ├── app.routes.ts          # All lazy-loaded routes
        ├── app.config.ts          # provideRouter, provideHttpClient, provideAnimations
        ├── layout/
        │   └── layout.component.ts   # Sidebar (navSections), header (dropdowns)
        ├── pages/                    # One folder per page
        │   ├── dashboard/
        │   ├── members/              # Member list
        │   ├── member-detail/        # Member detail/edit
        │   ├── contracts/            # Contract list
        │   ├── contract-detail/      # Contract detail
        │   ├── plans/
        │   ├── clubs/
        │   ├── courses/
        │   ├── schedule/             # Course session schedule (book/cancel)
        │   ├── employees/
        │   ├── shifts-schedule/      # Employee shift grid (week view)
        │   ├── equipment/
        │   ├── access-control/       # Access log + check-in form
        │   ├── guests/               # Guest management
        │   ├── analytics/
        │   │   ├── risk/
        │   │   ├── frequency/
        │   │   ├── options/
        │   │   └── health/
        │   ├── billing/
        │   │   ├── invoices/
        │   │   └── invoice-detail/
        │   ├── settings/
        │   ├── login/
        │   ├── signup/
        │   └── not-found/
        └── shared/
            ├── services/             # API service classes (one per domain)
            │   ├── analytics-api.service.ts
            │   ├── billing-api.service.ts
            │   ├── clubs-api.service.ts
            │   ├── courses-api.service.ts
            │   ├── employees-api.service.ts
            │   ├── equipment-api.service.ts
            │   ├── guests-api.service.ts
            │   ├── plans-api.service.ts
            │   ├── shifts-api.service.ts
            │   └── access-api.service.ts
            ├── mocks/riada-data.ts
            └── utils/
                ├── enum-labels.ts
                └── member-utils.ts
```

---

## Frontend Conventions

### Component pattern
All components are **standalone** (`standalone: true`). No NgModules.

```typescript
@Component({
  selector: 'app-foo',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, RouterLink],
  template: `...inline template...`,
})
export class FooComponent implements OnInit {
  private readonly api = inject(FooApiService);
  readonly items = signal<Item[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  // ...
}
```

### Routing
All routes use `loadComponent` lazy loading. Route params are bound via `@Input()` (enabled by `withComponentInputBinding()`).

### Lucide icons
```typescript
import { LucideAngularModule, Users, FileText } from 'lucide-angular';
// In component class:
readonly UsersIcon = Users;
readonly FileTextIcon = FileText;
// In template:
// <lucide-icon [img]="UsersIcon" [size]="20"></lucide-icon>
```

### API services
All HTTP calls go through `shared/services/*-api.service.ts`. Components inject these services — never use `HttpClient` directly in components. All API calls use relative paths (`/api/...`) so Angular CLI's proxy (`proxy.conf.json`) forwards them to the .NET backend.

### State management
- **Local UI state** → `signal()`, `computed()`
- **Forms** → `FormsModule` with `[(ngModel)]` for simple forms; `ReactiveFormsModule` for complex validation
- **Race condition guard** → `activeRequestId` pattern (increment on each request, discard stale responses)

### Control flow
Use Angular 17+ block syntax (`@if`, `@for`, `@switch`), never `*ngIf`/`*ngFor`.

### Tailwind
Color palette used across the project:
- Brand blue: `#4880FF` / `#EBEBFF`
- Success: `#00B69B` / `#E0F8EA`
- Warning: `#FF9066` / `#FFF3D6`
- Danger: `#FF4747` / `#FFF0F0`
- Background: `#F5F6FA`
- Text primary: `#111827` / `#202224`
- Text secondary: `#6B7280` / `#A6A6A6`
- Borders: `#E0E0E0` / `#F0F0F0`

---

## Backend Conventions

### API base URL
All controllers are under `/api/`. CORS allows `http://localhost:4200`. The `.env` file at `src/Riada.API/.env` contains `MYSQL_CONNECTION_STRING` (loaded via `DotNetEnv`).

### Controller naming
`[ApiController, Route("api/[controller]")]` — one controller per domain entity.

### Security
Every endpoint must have `[Authorize]` with appropriate roles. Roles: `Admin`, `Manager`, `Billing`, `Reception`, `Coach`. Never trust the frontend for security logic — backend enforces all permissions.

---

## Business Domain (Fitness SaaS)

Riada manages multi-centre professional fitness clubs. Core concepts:
- **Member** — client with an active or historical contract
- **Contract** — subscription linking a member to a plan (duration, price, options)
- **Club** — physical fitness centre
- **Course/Session** — scheduled group class with capacity limits
- **Shift** — employee work slot assigned to a club
- **Invoice** — billing document generated from contracts; payments are recorded separately
- **Access log** — entry/denial records for member and guest check-ins

---

## Key Architectural Decisions

1. **No NgRx** in the current frontend implementation — signals cover all local state needs.
2. **Inline templates** — all Angular components use inline `template:` strings (no separate `.html` files).
3. **No shared UI library** — each page component is self-contained with its own Tailwind markup.
4. **Real API only** — no mock data in production components; all pages call actual backend endpoints.
5. **Angular proxy** — dev server proxies `/api` to the .NET backend; no hardcoded base URLs.
