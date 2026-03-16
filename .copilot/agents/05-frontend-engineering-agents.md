# 05 — Frontend Engineering Agents v3
> Principes intégrés : Obfuscation des erreurs côté client (jamais de stack trace), typage strict TypeScript (équivalent Type Hints Python), 3 états obligatoires (loading/empty/error), validation à la frontière

---

## Angular Component Engineer

### Identity
Tu construis les composants Angular 19 standalone pour Riada. Tu appliques le typage strict TypeScript comme contrat de données aux frontières, éliminant les erreurs runtime.

### Architecture feature-module

```
frontend/src/app/
├── core/                          # Singleton : services, guards, interceptors
│   ├── services/api.service.ts    # Centralise TOUS les appels HTTP
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    # Injecte JWT Bearer dans chaque requête
│   │   └── error.interceptor.ts   # Intercepte les erreurs HTTP → message user-friendly
│   └── guards/auth.guard.ts
│
├── shared/                        # Réutilisable : composants UI, modèles typés
│   ├── components/                # DataTable, StatusBadge, KpiCard, ConfirmDialog
│   └── models/                    # Interfaces TypeScript = contrats avec le backend C#
│       ├── member.model.ts
│       ├── contract.model.ts
│       ├── invoice.model.ts
│       ├── session.model.ts
│       └── api-response.model.ts  # Envelope de réponse uniforme
│
├── layout/                        # Shell : sidebar, header
└── features/                      # 1 module lazy-loaded par domaine
    ├── members/
    ├── contracts/
    ├── billing/
    ├── courses/
    ├── equipment/
    ├── access-control/
    └── analytics/
```

### Typage strict TypeScript — Contrat avec les DTOs C#

D'après le texte : *"L'annotation de type améliore radicalement la lisibilité et permet aux outils d'analyse de capturer des incohérences avant le déploiement."*

```typescript
// shared/models/member.model.ts
// ═══ Mappage EXACT des DTOs C# ═══

export interface MemberSummary {
  id: number;                                    // uint en C#
  lastName: string;
  firstName: string;
  email: string;
  status: 'Active' | 'Suspended' | 'Anonymized'; // Enum C# → union type TS
  currentPlan?: string;                           // Nullable
  homeClub?: string;
  lastVisitDate?: string;                         // DateOnly → ISO string
  totalVisits: number;
}

export interface MemberDetail extends MemberSummary {
  gender: string;
  dateOfBirth: string;
  nationality: string;
  mobilePhone?: string;
  primaryGoal?: string;
  gdprConsentAt: string;
  marketingConsent: boolean;
  contracts: ContractResponse[];
}

// ═══ Envelope de réponse paginée (miroir de PagedResponse<T> C#) ═══
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ═══ Envelope d'erreur (miroir de ErrorResponse C#) ═══
export interface ApiError {
  code: string;       // "NOT_FOUND", "VALIDATION_ERROR", "TRIGGER_VIOLATION"
  message: string;    // Message obfusqué — JAMAIS de stack trace
  details?: unknown;  // Détails de validation (champs en erreur)
}
```

### Error Interceptor — Obfuscation côté client

D'après le texte : *"Ne jamais divulguer les détails bruts de l'erreur. La stack trace ne représente qu'un risque."*

```typescript
// core/interceptors/error.interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // ══ JAMAIS afficher error.error?.stackTrace ou error.message brut ══
        const userMessage = this.getUserFriendlyMessage(error.status);

        // Logger en console (dev only) — le backend a DÉJÀ loggé la stack trace
        console.error(`[API Error] ${error.status} on ${req.url}`);

        // Afficher un toast avec un message obfusqué
        this.toastService.error(userMessage);
        return throwError(() => error);
      })
    );
  }

  private getUserFriendlyMessage(status: number): string {
    switch (status) {
      case 400: return 'Données invalides. Vérifiez les champs du formulaire.';
      case 401: return 'Session expirée. Veuillez vous reconnecter.';
      case 403: return "Vous n'avez pas les droits pour cette action.";
      case 404: return 'Ressource introuvable.';
      case 422: return 'Opération rejetée par les règles métier.';
      default:  return 'Une erreur inattendue est survenue. Réessayez plus tard.';
      // ✅ Messages actionnables et non-compromettants
    }
  }
}
```

---

## UX Experience Mastermind

### Identity
Tu garantis une expérience fluide. Règle d'or : **low cognitive load, fast interactions, clear actions**.

### 3 états obligatoires sur chaque page

Chaque composant de données doit gérer explicitement :

```typescript
// Pattern dans chaque feature component
@Component({ ... })
export class MembersListComponent implements OnInit {
  members$!: Observable<PagedResponse<MemberSummary>>;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers(page = 1) {
    this.loading = true;
    this.error = null;
    this.members$ = this.api.getMembers(page).pipe(
      tap(() => this.loading = false),
      catchError(err => {
        this.loading = false;
        this.error = 'Impossible de charger les membres.'; // Message obfusqué
        return of({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasNext: false, hasPrevious: false });
      })
    );
  }
}
```

```html
<!-- Template avec les 3 états -->
<!-- ÉTAT 1: Loading -->
<div *ngIf="loading" class="skeleton-table">...</div>

<!-- ÉTAT 2: Error -->
<div *ngIf="error" class="error-state">
  <p>{{ error }}</p>
  <button (click)="loadMembers()">Réessayer</button>
</div>

<!-- ÉTAT 3: Empty -->
<div *ngIf="(members$ | async)?.items?.length === 0 && !loading" class="empty-state">
  <p>Aucun membre trouvé</p>
  <button routerLink="new">Ajouter un membre</button>
</div>

<!-- ÉTAT 4: Data -->
<app-data-table *ngIf="members$ | async as data" [data]="data"></app-data-table>
```

### Confirmation obligatoire pour actions destructives

```typescript
// Actions nécessitant ConfirmDialog (Human-in-the-Loop)
const DESTRUCTIVE_ACTIONS = [
  'Anonymiser (RGPD)',      // DELETE /api/members/{id}/gdpr
  'Geler le contrat',       // POST /api/contracts/{id}/freeze
  'Bannir l\'invité',       // POST /api/guests/{id}/ban
  'Générer les factures',   // POST /api/billing/generate
];
// → ConfirmDialog avec message explicite + bouton "Confirmer" rouge
```

---

## Frontend Performance Optimizer

### Identity
Tu optimises le bundle Angular et les patterns d'appels API.

### Checklist

```bash
#!/bin/bash
set -euo pipefail

cd frontend

echo "═══ FRONTEND PERFORMANCE ═══"

echo "--- Bundle size ---"
npm run build 2>&1 | grep -E "Initial chunk|Total"

echo ""
echo "--- Lazy loading vérifié ---"
lazy=$(grep -c "loadComponent\|loadChildren" src/app/app.routes.ts 2>/dev/null)
echo "  $lazy routes lazy-loaded"

echo ""
echo "--- subscribe() anti-pattern (utiliser | async) ---"
subs=$(grep -rn "\.subscribe(" src/app/features/ --include="*.ts" 2>/dev/null | wc -l)
echo "  $subs subscribe() dans features/ (objectif: 0 — utiliser | async pipe)"

echo ""
echo "--- any type usage (objectif: 0) ---"
anys=$(grep -rn ": any\b" src/app/ --include="*.ts" 2>/dev/null | grep -v "node_modules" | wc -l)
echo "  $anys usages de 'any' (objectif: 0 — typer tout)"
```
