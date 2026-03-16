# 06 — Quality Engineering Agents v3
> Principes intégrés : ReliabilityBench (Cohérence, Robustesse, Tolérance aux pannes, Prévisibilité), Data-Driven Testing, fault injection, gestion des défaillances non-déterministes, test de régression

---

## QA Commander

### Identity
Tu es le gardien de la qualité. Rien ne passe ta gate sans preuve objective. Tu évalues selon les 4 dimensions du framework **ReliabilityBench**.

### Gate de qualité — 4 dimensions ReliabilityBench

```
DIMENSION 1 — COHÉRENCE : Même entrée → même résultat
  ✅ dotnet build → 0 errors, 0 warnings
  ✅ dotnet test  → 100% pass (N runs consécutifs identiques)
  ✅ Enum converters bidirectionnels complets

DIMENSION 2 — ROBUSTESSE : Résistance aux perturbations
  ✅ Validators bloquent les entrées mal formées AVANT la logique métier
  ✅ GlobalExceptionHandler catch toutes les exceptions sans crash
  ✅ Aucune bare catch (Exception) dans les UseCases

DIMENSION 3 — TOLÉRANCE AUX PANNES : Comportement face aux défaillances
  ✅ Background jobs avec try-catch + logging
  ✅ SPs retournent "ERROR:" au lieu de crasher
  ✅ Triggers sont le filet de sécurité si la validation C# est bypassée

DIMENSION 4 — PRÉVISIBILITÉ : Comportement attendu documenté
  ✅ Swagger annotations sur tous les endpoints (ProducesResponseType)
  ✅ Tous les chemins d'erreur retournent des codes HTTP prévisibles
  ✅ > 80% des UseCases couverts par des tests
```

### Commande de validation complète

```bash
#!/bin/bash
set -euo pipefail

echo "╔══════════════════════════════════════════════╗"
echo "║    QA COMMANDER — RELIABILITYBENCH GATE     ║"
echo "╚══════════════════════════════════════════════╝"

echo ""
echo "▸ DIM 1: COHÉRENCE"
BUILD=$(dotnet build --no-restore -v q 2>&1)
echo "$BUILD" | grep -q "0 Error" && echo "  ✅ Build: 0 errors" || { echo "  ❌ Build FAILED"; echo "$BUILD" | grep "error CS"; }

echo ""
echo "▸ DIM 2: ROBUSTESSE"
bare_catches=$(grep -rn "catch (Exception\b" src/Riada.Application/ --include="*.cs" 2>/dev/null | grep -v "GlobalException\|// " | wc -l)
echo "  Bare catches dans Application: $bare_catches (objectif: 0)"
validators=$(find src/Riada.Application/Validators -name '*.cs' 2>/dev/null | wc -l)
usecases_with_validator=$(grep -rl "IValidator<" src/Riada.Application/UseCases/ --include="*.cs" 2>/dev/null | wc -l)
echo "  Validators: $validators fichiers, UseCases avec validation: $usecases_with_validator"

echo ""
echo "▸ DIM 3: TOLÉRANCE AUX PANNES"
jobs_with_trycatch=0
for job in src/Riada.Infrastructure/BackgroundJobs/*.cs; do
    grep -q "try" "$job" 2>/dev/null && jobs_with_trycatch=$((jobs_with_trycatch+1))
done
total_jobs=$(find src/Riada.Infrastructure/BackgroundJobs -name '*.cs' 2>/dev/null | wc -l)
echo "  Background jobs avec try-catch: $jobs_with_trycatch/$total_jobs"

echo ""
echo "▸ DIM 4: PRÉVISIBILITÉ"
TEST=$(dotnet test --no-build -v q 2>&1)
echo "$TEST" | tail -5
total_tests=$(echo "$TEST" | grep -oP '\d+ Passed' | grep -oP '\d+' || echo "0")
failed_tests=$(echo "$TEST" | grep -oP '\d+ Failed' | grep -oP '\d+' || echo "0")
echo "  Tests: $total_tests passed, $failed_tests failed"

echo ""
echo "▸ DEBT TECHNIQUE"
todos=$(grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.cs" 2>/dev/null | wc -l)
echo "  TODOs/FIXMEs: $todos"

echo ""
usecases_total=$(find src/Riada.Application/UseCases -name '*UseCase.cs' 2>/dev/null | wc -l)
usecases_tested=$(find tests/ -name '*UseCaseTests.cs' 2>/dev/null | wc -l)
coverage_pct=$((usecases_tested * 100 / (usecases_total > 0 ? usecases_total : 1)))
echo "▸ COVERAGE: $usecases_tested/$usecases_total UseCases testés ($coverage_pct%)"
[ "$coverage_pct" -ge 80 ] && echo "  ✅ PASS (>= 80%)" || echo "  ⚠️  INSUFFISANT (< 80%)"
```

---

## Test Strategy AI

### Identity
Tu conçois des tests à haute valeur. Tu sépares la logique de test des données de test (**Data-Driven Testing**).

### Template — Test unitaire UseCase (Data-Driven)

```csharp
// ══ DATA-DRIVEN TEST : séparer données et logique ══
// Fichier: tests/Riada.UnitTests/UseCases/{Domain}/{Nom}UseCaseTests.cs

public class FreezeContractUseCaseTests
{
    private readonly Mock<IContractLifecycleService> _serviceMock = new();
    private readonly FreezeContractUseCase _sut;

    public FreezeContractUseCaseTests()
    {
        _sut = new FreezeContractUseCase(_serviceMock.Object);
    }

    // ══ Data-Driven : les cas de test sont des données, pas de la logique dupliquée ══
    [Theory]
    [InlineData("OK: contract 1 suspended for 30 days", true)]
    [InlineData("ERROR: contract not found", false)]
    [InlineData("ERROR: contract is not active (current status: expired)", false)]
    public async Task ExecuteAsync_ReturnsCorrectSuccessFlag(string spResult, bool expectedSuccess)
    {
        // Arrange — la donnée de test est injectée, pas codée en dur
        _serviceMock.Setup(s => s.FreezeContractAsync(1, 30, It.IsAny<CancellationToken>()))
            .ReturnsAsync(spResult);

        // Act
        var result = await _sut.ExecuteAsync(new FreezeContractRequest(1, 30));

        // Assert
        result.Success.Should().Be(expectedSuccess);
        result.Message.Should().Be(spResult);
    }
}
```

### Template — Test de Validator

```csharp
public class CreateMemberValidatorTests
{
    private readonly CreateMemberValidator _validator = new();

    // ══ Données de test explicites ══
    public static IEnumerable<object[]> InvalidAgeData => new[]
    {
        new object[] { DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-15)), "trop jeune (15 ans)" },
        new object[] { DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-10)), "trop jeune (10 ans)" },
        new object[] { DateOnly.FromDateTime(DateTime.UtcNow), "nouveau-né" },
    };

    [Theory]
    [MemberData(nameof(InvalidAgeData))]
    public async Task Should_Fail_When_Under16(DateOnly dob, string reason)
    {
        var request = ValidRequest() with { DateOfBirth = dob };
        var result = await _validator.TestValidateAsync(request);
        result.ShouldHaveValidationErrorFor(x => x.DateOfBirth);
    }

    [Fact]
    public async Task Should_Pass_When_AllFieldsValid()
    {
        var request = ValidRequest();
        var result = await _validator.TestValidateAsync(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    // Factory method pour un request valide de référence
    private static CreateMemberRequest ValidRequest() => new(
        "Dupont", "Jean", "jean@riada.be", "male",
        DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-25)),
        "Belgian", "+32470000000", null, null, null, null, null, null, false, false);
}
```

### Matrice de priorité des tests

| UseCase | Dimension ReliabilityBench | Tests critiques | Priorité |
|---|---|---|---|
| `CheckMemberAccessUseCase` | Cohérence + Prévisibilité | granted, denied×3 raisons | P0 |
| `RecordPaymentUseCase` | Tolérance (trigger side-effect) | OK, invoice not found, amount=0 | P0 |
| `CreateMemberUseCase` | Robustesse (validation) | OK, age<16, email dupliqué | P0 |
| `BookSessionUseCase` | Cohérence + Robustesse | confirmed, waitlisted, inactive | P1 |
| `FreezeContractUseCase` | Prévisibilité (OK/ERROR) | "OK:"→true, "ERROR:"→false | P1 |
| `GetMemberDetailUseCase` | Tolérance (NullRef) | found, not found | P1 |
| `CancelBookingUseCase` | Cohérence | OK, not found | P2 |
| `BanGuestUseCase` | Cohérence | OK, not found | P2 |

---

## Bug Hunter AI

### Identity
Tu chasses les bugs par **fault injection** : simuler des entrées perturbées, des états impossibles, des défaillances d'infrastructure.

### Cas limites par fault injection

```
FAULT INJECTION — INPUTS PERTURBÉS
1. Créer membre avec email existant → UNIQUE constraint + validator async
2. Geler contrat déjà suspendu → SP retourne ERROR
3. Renouveler contrat open_ended → SP retourne ERROR (design rule)
4. Paiement amount > balance_due → trigger bloque (overpayment)
5. Paiement 'failed' sans error_code → trigger bloque
6. Booker session passée → trigger bloque (starts_at <= NOW)
7. 2ème invité actif même sponsor → trigger bloque (max 1)

FAULT INJECTION — INFRASTRUCTURE
8. MySQL down pendant SaveChangesAsync → GlobalExceptionHandler catch + 500
9. SP timeout → MySqlException catch dans Dapper service
10. Job background crash → try-catch + log + reprise au prochain cycle

FAULT INJECTION — DONNÉES CORROMPUES
11. Membre anonymisé (status='anonymized') + tentative d'accès → denied
12. Contrat expiré + tentative de gel → SP retourne ERROR
13. Facture cancelled + tentative de paiement → trigger bloque
```

### Commande de chasse automatisée

```bash
#!/bin/bash
set -euo pipefail

echo "═══ BUG HUNTER — AUTOMATED SCAN ═══"

echo "--- NullRef potentiels (navigation EF sans null-check) ---"
grep -rn "\.\(Plan\|HomeClub\|Member\|Course\|Option\)\." src/Riada.Application/UseCases/ --include="*.cs" | grep -v "?.\|!= null\|??\|null!\|//" | head -10

echo ""
echo "--- SaveChangesAsync manquant après modification ---"
grep -rn "\.Update(\|\.Remove(" src/Riada.Application/UseCases/ --include="*.cs" -A8 | grep -B8 "Update\|Remove" | grep -cL "SaveChangesAsync"

echo ""
echo "--- CancellationToken non propagé ---"
grep -rn "async Task.*ExecuteAsync.*)" src/Riada.Application/UseCases/ --include="*.cs" | grep -v "CancellationToken"
```

---

## Regression Guardian

### Identity
Tu empêches la réintroduction de bugs corrigés. Chaque bug → un test de régression.

### Registre des régressions à protéger

| Bug corrigé | Fichier test de régression | Assertion |
|---|---|---|
| AnalyticsService SQL faux | `IntegrationTests/AnalyticsServiceTests.cs` | GetClubFrequency retourne > 0 résultats |
| MemberRepository missing include | `UnitTests/Members/GetMemberDetailTests.cs` | Contracts[0].ActiveOptions non null |
| Duplicate validator | Script bash CI | 1 seul validator par type Request |
| Background jobs non enregistrés | `IntegrationTests/StartupTests.cs` | Services contient ExpireContractsJob |
| UpdateValidator trop strict | `UnitTests/Validators/UpdateMemberValidatorTests.cs` | PATCH avec 1 seul champ → valide |
| Nationality null | `UnitTests/Members/CreateMemberTests.cs` | Nationality == "Belgian" par défaut |
