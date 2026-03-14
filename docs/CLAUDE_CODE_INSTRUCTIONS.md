# 🎯 CLAUDE CODE — Mission Riada C# Project

## CONTEXTE

Tu travailles sur le projet Riada, une API ASP.NET Core 8 en Clean Architecture connectée à une base MySQL 8 existante (`riada_db`). Le scaffold de 155 fichiers C# a été généré mais n'a jamais été compilé. La base MySQL est déjà installée et fonctionnelle avec 21 tables, 28 triggers, 8 procédures stockées.

**Stack :** ASP.NET Core 8, EF Core (Pomelo MySQL), Dapper, FluentValidation, JWT Bearer, Swagger

**Structure :**
```
src/Riada.Domain/         → Entités, Enums, Interfaces (0 dépendance)
src/Riada.Application/    → UseCases, DTOs, Validators
src/Riada.Infrastructure/  → EF Core DbContext, Configs, Repos, Dapper SP services
src/Riada.API/            → Controllers, Middleware, Auth, Program.cs
tests/                    → UnitTests + IntegrationTests
sql/                      → 10 scripts MySQL (01 à 10)
```

---

## PHASE 1 — BUILD PROPRE (Priorité absolue)

### 1.1 Résoudre tous les build errors

```bash
dotnet restore
dotnet build 2>&1 | head -100
```

Corriger itérativement TOUS les erreurs de compilation. Problèmes probables :
- **Nullable enums** dans les EF configs : les conversions `HasConversion` pour `PrimaryGoal?`, `AcquisitionSource?`, `ActivityType?` utilisent des lambdas avec `v.Value` qui peuvent NRE. Utiliser `ValueConverter<TEnum?, string?>` explicite.
- **Références circulaires** entre Application et Infrastructure — s'assurer que Application ne référence JAMAIS Infrastructure.
- **`using` manquants** — certaines entités référencent des entités d'autres namespaces (ex: `Contract` référence `Club` et `Invoice`).
- **`ushort` vs `short`** — EF Core / Pomelo peut ne pas supporter `ushort` nativement pour `SMALLINT UNSIGNED`. Convertir en `short` ou `int` si nécessaire.
- **`ulong` pour BIGINT UNSIGNED** — vérifier que Pomelo le mappe correctement, sinon utiliser `long`.

### 1.2 Vérifier la connexion DB

S'assurer que `appsettings.Development.json` a la bonne connexion MySQL et que `dotnet run` démarre sans crash :

```bash
cd src/Riada.API
dotnet run
```

Swagger doit être accessible. Si EF crashe au démarrage (schema mismatch), NE PAS utiliser les migrations EF — la DB existe déjà. S'assurer que `RiadaDbContext` est en mode "database-first" pur (pas de `Database.Migrate()` dans Program.cs).

---

## PHASE 2 — COMPLÉTER LES USE CASES MANQUANTS

Les UseCases suivants sont scaffold mais incomplets ou absents. Les implémenter :

### 2.1 Members
- `CreateMemberUseCase` — Valide via `CreateMemberValidator`, crée le `Member` via repo, `SaveChangesAsync`. Le trigger MySQL `trg_before_member_insert_age` vérifie l'âge >= 16.
- `UpdateMemberUseCase` — Charge le membre, mappe les champs modifiables (pas email, pas date_of_birth sauf cas spécial), save.

### 2.2 Contracts
- `CreateContractUseCase` — Crée un contrat avec plan_id, home_club_id. Les triggers MySQL vérifient la cohérence (membre actif, pas de freeze/cancel markers sur contrat actif).
- `GetContractDetailUseCase` — Charge contrat + options + factures via `IContractRepository.GetWithOptionsAsync`.

### 2.3 Billing
- `RecordPaymentUseCase` — INSERT dans `payments`. Le trigger MySQL `trg_after_payment_insert` met à jour automatiquement la facture (amount_paid, status). Attention : après le save, recharger la facture pour voir le statut mis à jour par le trigger.

### 2.4 Courses
- `BookSessionUseCase` — FIX REQUIS : le code actuel ne fait pas réellement l'INSERT du booking. Il faut ajouter le `Booking` au DbContext et sauvegarder. Le trigger `trg_before_booking_insert_policy` vérifie la politique, `trg_before_booking_insert_cap` vérifie la capacité, `trg_after_booking_insert` incrémente `enrolled_count`.
- `CancelBookingUseCase` — Met le status à 'cancelled'. Trigger `trg_after_booking_update` décrémente `enrolled_count`.

### 2.5 Equipment
- `ListEquipmentUseCase` — Liste équipements avec filtres (club_id, status).
- `CreateMaintenanceTicketUseCase` — Crée ticket. Triggers vérifient le rôle technicien et le lifecycle.
- `UpdateTicketStatusUseCase` — Met à jour status + resolved_at si résolu.

### 2.6 Guests
- `BanGuestUseCase` — Met le status de l'invité à 'banned'.

### 2.7 Analytics (tous via Dapper raw SQL, pas EF)
- `GetClubFrequencyReportUseCase` — Requête depuis `08_Select_Queries.sql` (fréquentation 30j par club).
- `GetOptionPopularityUseCase` — Options les plus souscrites.
- `RunSystemHealthCheckUseCase` — Transposition de `10_System_Check.sql` en requêtes Dapper.

---

## PHASE 3 — ENREGISTRER TOUT DANS LE DI

### 3.1 Application/DependencyInjection.cs
Enregistrer TOUS les nouveaux UseCases en `AddScoped<>`.

### 3.2 Infrastructure/DependencyInjection.cs
Enregistrer les repositories manquants si besoin (IEquipmentRepository, IMaintenanceTicketRepository).

### 3.3 Program.cs
- Enregistrer les background jobs :
```csharp
builder.Services.AddHostedService<ExpireContractsJob>();
builder.Services.AddHostedService<ExpireInvoicesJob>();
```
- Enregistrer les analytics UseCases qui nécessitent le connection string.

---

## PHASE 4 — CONTROLLERS COMPLETS

S'assurer que chaque UseCase a un endpoint correspondant dans un Controller. Mapping attendu :

| UseCase | Controller | Route | Méthode |
|---------|-----------|-------|---------|
| CreateMemberUseCase | MembersController | POST /api/members | Create |
| UpdateMemberUseCase | MembersController | PUT /api/members/{id} | Update |
| CreateContractUseCase | ContractsController | POST /api/contracts | Create |
| GetContractDetailUseCase | ContractsController | GET /api/contracts/{id} | GetDetail |
| RecordPaymentUseCase | BillingController | POST /api/billing/payments | RecordPayment |
| CancelBookingUseCase | CoursesController | DELETE /api/courses/bookings/{mid}/{sid} | CancelBooking |
| BanGuestUseCase | GuestsController | POST /api/guests/{id}/ban | Ban |
| ListEquipmentUseCase | EquipmentController | GET /api/equipment | List |
| CreateMaintenanceTicketUseCase | EquipmentController | POST /api/equipment/maintenance | Create |
| UpdateTicketStatusUseCase | EquipmentController | PATCH /api/equipment/maintenance/{id} | UpdateStatus |
| GetClubFrequencyReportUseCase | AnalyticsController | GET /api/analytics/frequency | GetFrequency |
| GetOptionPopularityUseCase | AnalyticsController | GET /api/analytics/options | GetOptions |
| RunSystemHealthCheckUseCase | AnalyticsController | GET /api/analytics/health | GetHealth |

Créer `EquipmentController` s'il n'existe pas encore.

---

## PHASE 5 — VALIDATION & ERROR HANDLING

### 5.1 Validation pipeline automatique
Ajouter un `ValidationFilter` ou un middleware qui exécute automatiquement les FluentValidation validators AVANT que le UseCase ne s'exécute. Option recommandée :

```csharp
// Dans Program.cs ou un filter
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});
```

### 5.2 Compléter les validators manquants
- `CreateContractValidator` — start_date <= today, plan_id > 0, home_club_id > 0
- `BookSessionValidator` — member_id > 0, session_id > 0
- `CreateMaintenanceTicketValidator` — equipment_id > 0, priority valide

### 5.3 GlobalExceptionHandler
Vérifier que le handler attrape bien :
- `NotFoundException` → 404
- `BusinessRuleException` → 422
- `ConflictException` → 409
- `MySqlException` avec SqlState "45000" → 422 (trigger violation)
- `ValidationException` → 400
- Toute autre exception → 500

---

## PHASE 6 — TESTS

### 6.1 Tests unitaires (Riada.UnitTests)
Écrire des tests pour les UseCases principaux en mockant les repositories/services :

```
tests/Riada.UnitTests/UseCases/
├── Access/
│   ├── CheckMemberAccessTests.cs    # Mock IAccessCheckService, verify granted/denied
│   └── CheckGuestAccessTests.cs
├── Members/
│   └── GetMemberDetailTests.cs      # Mock IMemberRepository, verify mapping
├── Billing/
│   └── GetInvoiceDetailTests.cs     # Mock IInvoiceRepository
└── Contracts/
    ├── FreezeContractTests.cs       # Test OK/ERROR parsing
    └── RenewContractTests.cs
```

Technologies : xUnit, Moq, FluentAssertions

### 6.2 Tests d'intégration (Riada.IntegrationTests)
Utiliser `Testcontainers.MySql` pour spin up une DB MySQL éphémère, y exécuter les 7 scripts SQL, puis tester :

```
tests/Riada.IntegrationTests/
├── Fixtures/
│   └── DatabaseFixture.cs           # MySqlContainer + execute sql/01-07
├── StoredProcedures/
│   ├── CheckAccessTests.cs          # Reproduire T07-T09, T22-T23 du 09_Tests.sql
│   ├── GenerateInvoiceTests.cs
│   └── FreezeContractTests.cs
├── Triggers/
│   ├── PaymentTriggerTests.cs       # T17: paiement → facture paid
│   ├── GuestLimitTriggerTests.cs    # T15: max 1 invité actif
│   └── AgeRestrictionTests.cs       # T16: < 16 ans rejeté
└── Endpoints/
    └── AccessEndpointTests.cs       # WebApplicationFactory HTTP tests
```

---

## PHASE 7 — POLISH

### 7.1 Swagger annotations
Ajouter `[ProducesResponseType]` sur les controllers pour documenter les réponses possibles (200, 400, 404, 422).

### 7.2 Logging
Vérifier que Serilog est bien configuré dans Program.cs. Les UseCases critiques (Access, Payment, GDPR) doivent logger les opérations.

### 7.3 CORS
Confirmer que les origines Angular (`localhost:4200`) et React (`localhost:3000`) sont autorisées.

### 7.4 Health check endpoint
Ajouter un `/health` qui vérifie la connectivité MySQL :
```csharp
builder.Services.AddHealthChecks()
    .AddMySql(connectionString, name: "mysql");
app.MapHealthChecks("/health");
```

---

## RÈGLES IMPORTANTES

1. **Ne JAMAIS modifier les scripts SQL** — la DB existe déjà et est gérée séparément.
2. **Ne JAMAIS utiliser EF Migrations** — c'est du database-first, le schema est géré par les scripts SQL.
3. **Toujours utiliser Dapper pour les appels aux 8 SPs** — EF Core n'est pas adapté pour les paramètres OUT.
4. **Les triggers MySQL sont le filet de sécurité final** — la validation C# est une pré-validation pour donner de meilleurs messages d'erreur, mais les triggers protègent l'intégrité.
5. **Les colonnes GENERATED** (vat_amount, amount_incl_tax, balance_due, line_amount_*) ne doivent JAMAIS être écrites par EF Core → `ValueGeneratedOnAddOrUpdate()`.
6. **Après un INSERT qui déclenche un trigger modifiant d'autres tables** (ex: payment → invoice update), recharger l'entité pour voir l'état à jour.
7. **Les EnumConverters** doivent mapper exactement les strings MySQL snake_case ↔ C# PascalCase.

---

## COMMANDE DE DÉMARRAGE

```bash
cd /path/to/Riada
dotnet restore
dotnet build
# Fixer toutes les erreurs
# Puis itérer sur les phases 2-7
```

L'objectif final : `dotnet build` = 0 errors, `dotnet test` = tous les tests passent, `dotnet run` = Swagger accessible avec tous les endpoints fonctionnels connectés à riada_db.
