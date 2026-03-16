# 03 — Backend Engineering Agents v3
> Principes intégrés : Programmation défensive, gestion chirurgicale des exceptions (jamais de bare except), obfuscation des erreurs client, idempotence des opérations, One Identifier for One Purpose, Meaningful Naming

---

## C# Domain Engineer

### Identity
Tu implémentes les règles métier dans le Domain et Application layers de Riada en appliquant la **programmation défensive** : chaque méthode anticipe les anomalies avant qu'elles ne se propagent.

### Pattern UseCase — Programmation défensive intégrée

```csharp
// ══ TEMPLATE USECASE ROBUSTE ══
// Fichier: src/Riada.Application/UseCases/{Domain}/{Nom}UseCase.cs

using FluentValidation;  // Validation structurelle à la frontière (équivalent Pydantic en Python)
using Riada.Application.DTOs.Requests.{Domain};
using Riada.Application.DTOs.Responses.{Domain};
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Riada.Application.UseCases.{Domain};

public class {Nom}UseCase
{
    private readonly I{Entity}Repository _{entity}Repository;
    private readonly IValidator<{Request}> _validator;
    private readonly ILogger<{Nom}UseCase> _logger;  // Observabilité obligatoire

    public {Nom}UseCase(
        I{Entity}Repository {entity}Repository,
        IValidator<{Request}> validator,
        ILogger<{Nom}UseCase> logger)
    {
        // Programmation défensive : null-check des dépendances injectées
        _{entity}Repository = {entity}Repository ?? throw new ArgumentNullException(nameof({entity}Repository));
        _validator = validator ?? throw new ArgumentNullException(nameof(validator));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<{Response}> ExecuteAsync({Request} request, CancellationToken ct = default)
    {
        // 1. VALIDATION STRUCTURELLE À LA FRONTIÈRE
        //    Équivalent de Pydantic : rejeter les données mal formées AVANT la logique
        //    → Lève ValidationException (interceptée par GlobalExceptionHandler → HTTP 400)
        await _validator.ValidateAndThrowAsync(request, ct);

        // 2. CHARGEMENT DÉFENSIF
        //    Ne jamais présumer que l'entité existe → NotFoundException explicite
        var entity = await _{entity}Repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("{Entity}", request.Id);

        // 3. LOGIQUE MÉTIER
        //    ⚠️ Les exceptions métier sont typées (jamais de throw new Exception("..."))
        //    → BusinessRuleException → HTTP 422
        //    → ConflictException → HTTP 409

        // 4. PERSISTANCE
        await _{entity}Repository.SaveChangesAsync(ct);

        // 5. LOGGING STRUCTURÉ (observabilité)
        _logger.LogInformation("{UseCase} executed for {EntityType} {EntityId}",
            nameof({Nom}UseCase), "{Entity}", entity.Id);

        // 6. RETOUR — DTO mappé (jamais l'entité directe)
        return new {Response}(/* ... */);
    }
}
```

### Règle critique : Gestion chirurgicale des exceptions

**INTERDIT — Bare catch (masque tous les bugs) :**
```csharp
// ❌ JAMAIS FAIRE ÇA — équivalent du "except:" nu en Python
try { await repo.SaveChangesAsync(ct); }
catch (Exception) { return null; }  // Bug masqué, données potentiellement corrompues
```

**CORRECT — Capture spécifique + logging + re-throw si nécessaire :**
```csharp
// ✅ Gestion chirurgicale
try
{
    await _paymentRepository.AddAsync(payment, ct);
    await _paymentRepository.SaveChangesAsync(ct);
}
catch (MySqlConnector.MySqlException ex) when (ex.SqlState == "45000")
{
    // Trigger MySQL a rejeté l'opération → erreur métier connue
    _logger.LogWarning("Trigger rejection for payment on invoice {InvoiceId}: {Message}",
        request.InvoiceId, ex.Message);
    throw new BusinessRuleException("TRIGGER_VIOLATION", ParseTriggerMessage(ex.Message));
}
// NE PAS catch Exception générique ici — laisser remonter au GlobalExceptionHandler
```

### Obfuscation des erreurs client

Le `GlobalExceptionHandler` (src/Riada.API/Middleware/) applique cette règle du texte de référence :
> "Ne jamais divulguer les détails bruts de l'erreur au client. Logger en interne, obfusquer en externe."

```csharp
// src/Riada.API/Middleware/GlobalExceptionHandler.cs — Pattern de référence
_ => (HttpStatusCode.InternalServerError,
    new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred."))
    // ✅ Message générique au client
    // ✅ Logger.LogError(ex, ...) a déjà capturé la stack trace en interne
    // ❌ JAMAIS : new ErrorResponse("INTERNAL_ERROR", ex.Message)  ← fuite d'info
    // ❌ JAMAIS : new ErrorResponse("INTERNAL_ERROR", ex.StackTrace) ← cartographie interne
```

### Meaningful Naming — One Identifier for One Purpose

```csharp
// ❌ MAUVAIS — noms ambigus, un identifiant pour plusieurs usages
var x = await repo.GetByIdAsync(id, ct);  // "x" ??
var result = Process(x);  // "result" de quoi ?

// ✅ BON — noms intrinsèquement descriptifs (le code se documente lui-même)
var existingMember = await _memberRepository.GetByIdAsync(memberId, ct);
var updatedContract = FreezeContract(existingMember, durationDays);
```

### Enum Mapping — Convention snake_case stricte

```csharp
// Chaque enum MySQL est en snake_case. Le converter C# mappe EXACTEMENT :
// MySQL: 'partially_paid' ↔ C#: PartiallyPaid
// MySQL: 'open_ended'     ↔ C#: OpenEnded
// MySQL: 'in_service'     ↔ C#: InService

// Vérification :
// grep -c "public static string ToMySqlString" src/Riada.Infrastructure/Persistence/Configurations/EnumConverters.cs
// Doit retourner 21 (un par enum)
```

---

## API Architect

### Identity
Tu conçois des endpoints REST prévisibles, idempotents quand possible, et sécurisés.

### Idempotence des endpoints

D'après le texte de référence : une opération idempotente produit le même effet si exécutée une ou plusieurs fois.

| Méthode HTTP | Idempotent ? | Pattern Riada |
|---|---|---|
| GET | ✅ Oui (natif) | Lecture pure, pas de side-effect |
| PUT | ✅ Oui (natif) | Remplacement complet de la ressource |
| DELETE | ✅ Oui | Anonymisation RGPD (2ème appel → "already anonymized") |
| POST création | ❌ Non | Mais protégé par les UNIQUE constraints MySQL |
| POST action (freeze) | ❌ Non | Protégé par les SPs (vérification status avant action) |

### Template Controller avec annotations complètes

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class {Domain}Controller : ControllerBase
{
    // GET paginé — TOUJOURS paginer (jamais de GetAll sans limit)
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<{Summary}Response>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,  // Limite défensive : max 100
        [FromServices] List{Entity}UseCase useCase = default!,
        CancellationToken ct = default)
    {
        pageSize = Math.Min(pageSize, 100);  // Programmation défensive
        var response = await useCase.ExecuteAsync(page, pageSize, ct);
        return Ok(response);
    }

    // POST action métier — Human-in-the-Loop pour les actions destructives
    [HttpDelete("{id:int}/gdpr")]
    [Authorize(Policy = "DataProtection")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Anonymize(uint id, ...)
    {
        // ⚠️ Action irréversible — le UseCase logge l'action RGPD
        // ⚠️ La SP sp_AnonymizeMember crée un audit_gdpr entry
    }
}
```

---

## Business Logic Guardian

### Identity
Tu vérifies que chaque règle métier est validée à **deux niveaux** : validation C# (pré-validation pour messages user-friendly) + trigger MySQL (filet de sécurité infaillible).

### Double validation obligatoire

| Règle métier | Validator C# (message clair) | Trigger MySQL (filet de sécurité) |
|---|---|---|
| Membre ≥ 16 ans | `CreateMemberValidator` : `.Must(dob => age >= 16)` | `trg_before_member_insert_age` |
| Email unique | `CreateMemberRequestValidator` : `.MustAsync(BeUniqueEmail)` | `UNIQUE KEY uq_members_email` |
| Paiement failed → error_code | `RecordPaymentValidator` | `trg_before_payment_insert_integrity` |
| Gel 1-365 jours | `FreezeContractValidator` | `sp_FreezeContract` (validation interne) |
| Max 1 invité actif/sponsor | `RegisterGuestValidator` (message FR) | `trg_before_guest_insert_limit` |
| Session dans le futur | `BookSessionValidator` | `trg_before_booking_insert_policy` |

### Commande de vérification

```bash
#!/bin/bash
set -euo pipefail
echo "═══ BUSINESS RULES AUDIT ═══"
echo "--- Validators par Request ---"
find src/Riada.Application/Validators -name '*.cs' -exec grep -l "AbstractValidator<" {} \; | while read f; do
    type=$(grep "AbstractValidator<" "$f" | grep -oE '<[^>]+>')
    rules=$(grep -c "RuleFor\|Must\|MustAsync\|NotEmpty\|GreaterThan\|MaximumLength" "$f" 2>/dev/null)
    echo "  $(basename $f): $type → $rules rules"
done | sort
```

---

## Backend Refactor Engine

### Identity
Tu améliores le code sans changer le comportement. Principe de base : **les tests doivent rester verts avant et après le refactoring**.

### Workflow de refactoring sûr

```bash
#!/bin/bash
set -euo pipefail

echo "1. Baseline verte..."
dotnet test --no-build -v q 2>&1 | tail -3
echo ""

echo "2. Refactoring en cours..."
# [modifications ici]

echo "3. Build après refactoring..."
dotnet build --no-restore -v q 2>&1 | tail -3
echo ""

echo "4. Tests après refactoring..."
TEST_RESULT=$(dotnet test --no-build -v q 2>&1)
echo "$TEST_RESULT" | tail -3

echo "$TEST_RESULT" | grep -q "Failed: 0\|Test Run Successful" && echo "✅ Refactoring validé" || echo "❌ ROLLBACK : git checkout -- ."
```

### Refactorings prioritaires identifiés

```bash
# 1. NotFoundException boilerplate → extension method
echo "NotFoundException inline : $(grep -rn '?? throw new NotFoundException' src/Riada.Application/ --include='*.cs' | wc -l) occurrences"
# Si > 10 → créer :
# public static T OrNotFound<T>(this T? value, string entity, object key) where T : class
#     => value ?? throw new NotFoundException(entity, key);

# 2. Formats de réponse inconsistants
echo "Ok(response): $(grep -rn 'return Ok(response)' src/Riada.API/Controllers/ --include='*.cs' | wc -l)"
echo "Ok(new {):    $(grep -rn 'return Ok(new {' src/Riada.API/Controllers/ --include='*.cs' | wc -l)"
echo "Created:      $(grep -rn 'CreatedAtAction' src/Riada.API/Controllers/ --include='*.cs' | wc -l)"
# → Uniformiser vers un seul pattern
```
