# 02 — System Intelligence Agents v3
> Principes intégrés : Progressive Disclosure (anti-Mega-Prompt), Lost-in-the-Middle, ReliabilityBench (4 dimensions), Data-Driven Testing, analyse de gap

---

## Project Analyst

### Identity
Tu cartographies l'état réel du projet Riada AVANT toute implémentation. Tu ne devines jamais — tu vérifies. Tu appliques le principe de **Progressive Disclosure** : charger uniquement les métadonnées nécessaires, pas la totalité du contexte.

### Niveau 1 — Inventaire léger (métadonnées uniquement)

```bash
#!/bin/bash
set -euo pipefail

echo "═══ PROJECT ANALYST — INVENTAIRE LÉGER ═══"
echo "--- Solution ---"
find . -name "*.csproj" -exec basename {} \; | sort

echo ""
echo "--- Volume par couche ---"
for layer in Domain Application Infrastructure API; do
    count=$(find "src/Riada.$layer" -name '*.cs' 2>/dev/null | wc -l)
    printf "  Riada.%-20s %3d fichiers C#\n" "$layer" "$count"
done
test_unit=$(find tests/Riada.UnitTests -name '*.cs' 2>/dev/null | wc -l)
test_integ=$(find tests/Riada.IntegrationTests -name '*.cs' 2>/dev/null | wc -l)
printf "  UnitTests               %3d fichiers\n" "$test_unit"
printf "  IntegrationTests        %3d fichiers\n" "$test_integ"

echo ""
echo "--- Compteurs critiques ---"
echo "  Entités:      $(find src/Riada.Domain/Entities -name '*.cs' 2>/dev/null | wc -l)"
echo "  UseCases:     $(find src/Riada.Application/UseCases -name '*UseCase.cs' 2>/dev/null | wc -l)"
echo "  Controllers:  $(find src/Riada.API/Controllers -name '*.cs' 2>/dev/null | wc -l)"
echo "  Repositories: $(find src/Riada.Infrastructure/Repositories -name '*.cs' 2>/dev/null | wc -l)"
echo "  Validators:   $(find src/Riada.Application/Validators -name '*.cs' 2>/dev/null | wc -l)"
echo "  SP Services:  $(find src/Riada.Infrastructure/StoredProcedures -name '*.cs' 2>/dev/null | wc -l)"
echo "  Tests:        $(find tests/ -name '*Tests.cs' 2>/dev/null | wc -l)"
```

### Niveau 2 — Gap Analysis (charger uniquement si le Niveau 1 révèle des anomalies)

**Gap : UseCases sans endpoint (code mort ou fonctionnalité non exposée)**
```bash
echo "═══ GAP: UseCases sans endpoint ═══"
for uc in $(find src/Riada.Application/UseCases -name '*UseCase.cs' -exec basename {} .cs \; | sort); do
    found=$(grep -rl "$uc" src/Riada.API/Controllers/ 2>/dev/null | wc -l)
    [ "$found" -eq 0 ] && echo "  ⚠️  $uc → aucun endpoint"
done
```

**Gap : Interfaces Domain sans implémentation Infrastructure**
```bash
echo "═══ GAP: Interfaces sans implémentation ═══"
for iface in $(find src/Riada.Domain/Interfaces -name 'I*.cs' -exec basename {} .cs \; | sort); do
    impl=$(echo "$iface" | sed 's/^I//')
    found=$(find src/Riada.Infrastructure -name "$impl.cs" 2>/dev/null | wc -l)
    [ "$found" -eq 0 ] && echo "  ⚠️  $iface → pas d'implémentation"
done
```

**Gap : UseCases sans test unitaire**
```bash
echo "═══ GAP: UseCases sans test ═══"
for uc in $(find src/Riada.Application/UseCases -name '*UseCase.cs' -exec basename {} .cs \; | sort); do
    test_file="${uc}Tests.cs"
    found=$(find tests/ -name "$test_file" 2>/dev/null | wc -l)
    [ "$found" -eq 0 ] && echo "  ⚠️  $uc → pas de test"
done
```

**Gap : Enregistrements DI manquants**
```bash
echo "═══ GAP: DI manquants ═══"
for uc in $(find src/Riada.Application/UseCases -name '*UseCase.cs' -exec basename {} .cs \; | sort); do
    registered=$(grep -c "$uc" src/Riada.Application/DependencyInjection.cs 2>/dev/null)
    [ "$registered" -eq 0 ] && echo "  ⚠️  $uc → pas dans DependencyInjection.cs"
done
```

### Niveau 3 — État du build et des tests

```bash
echo "═══ BUILD & TEST STATE ═══"
dotnet restore --verbosity quiet 2>&1 | tail -1
BUILD_OUTPUT=$(dotnet build --no-restore -v q 2>&1)
echo "$BUILD_OUTPUT" | grep -E "error CS|warning CS|Build succeeded" | head -20
echo ""
TEST_OUTPUT=$(dotnet test --no-build -v q 2>&1)
echo "$TEST_OUTPUT" | tail -10
```

---

## Risk Detection Agent

### Identity
Tu détectes les risques techniques selon les 4 dimensions du framework **ReliabilityBench** : Cohérence, Robustesse, Tolérance aux pannes, Prévisibilité.

### Scan de risques par dimension

**Dimension 1 — Cohérence (même entrée → même résultat)**

```bash
echo "═══ RISK: COHÉRENCE ═══"

# SQL avec noms de tables/colonnes incorrects → résultats incohérents
echo "--- Tables SQL suspectes dans les services Dapper ---"
REAL_TABLES="clubs employees members contracts contract_options subscription_plans service_options subscription_plan_options courses class_sessions bookings equipment maintenance_tickets invoices invoice_lines invoice_sequences payments access_log guests guest_access_log audit_gdpr"
grep -rn "FROM \|JOIN " src/Riada.Infrastructure/StoredProcedures/ --include="*.cs" 2>/dev/null | while read line; do
    echo "$line" | grep -oiE 'FROM [a-z_]+|JOIN [a-z_]+' | awk '{print $2}' | while read tbl; do
        echo "$REAL_TABLES" | tr ' ' '\n' | grep -qx "$tbl" || echo "  ❌ Table inconnue '$tbl' dans: $line"
    done
done

# Enum converters incomplets → mapping incohérent
echo ""
echo "--- Enums sans converter bidirectionnel ---"
domain_enums=$(find src/Riada.Domain/Enums -name '*.cs' -exec basename {} .cs \; | sort)
converter_enums=$(grep "public static string ToMySqlString(this " src/Riada.Infrastructure/Persistence/Configurations/EnumConverters.cs 2>/dev/null | grep -oE 'this [A-Za-z]+' | awk '{print $2}' | sort)
diff <(echo "$domain_enums") <(echo "$converter_enums") 2>/dev/null | grep "^<" | sed 's/^< /  ⚠️  Enum sans converter: /'
```

**Dimension 2 — Robustesse (résistance aux entrées perturbées)**

```bash
echo "═══ RISK: ROBUSTESSE ═══"

# Validators dupliqués → conflit FluentValidation DI
echo "--- Validators dupliqués pour le même type ---"
find src/Riada.Application/Validators -name '*.cs' -exec grep -lH "AbstractValidator<" {} \; 2>/dev/null | while read f; do
    type=$(grep "AbstractValidator<" "$f" | grep -oE '<[^>]+>' | head -1)
    echo "$type|$f"
done | sort | awk -F'|' '{a[$1]=a[$1]" "$2} END{for(k in a) if(split(a[k],b," ")>2) print "  ❌ DOUBLON "k": "a[k]}'

# Écriture dans colonnes GENERATED → crash MySQL
echo ""
echo "--- Écriture illégale dans colonnes GENERATED ---"
grep -rn "VatAmount\s*=\|AmountInclTax\s*=\|BalanceDue\s*=\|LineAmountExclTax\s*=\|LineAmountInclTax\s*=" \
    src/Riada.Application/ src/Riada.Infrastructure/ --include="*.cs" 2>/dev/null | grep -v "ValueGenerated\|get;\|set;\|// \|///\|public" | while read line; do
    echo "  ❌ $line"
done

# Variables nullables sans guard → NullReferenceException
echo ""
echo "--- Accès navigation EF sans null-check ---"
grep -rn "\.\(Plan\|HomeClub\|Member\|Course\|Instructor\|Option\|Contract\|SponsorMember\)\." \
    src/Riada.Application/UseCases/ --include="*.cs" 2>/dev/null | grep -v "?.\|!= null\|is not null\|??\|null!" | head -15
```

**Dimension 3 — Tolérance aux pannes**

```bash
echo "═══ RISK: TOLÉRANCE AUX PANNES ═══"

# Background Jobs sans try-catch → crash silencieux
echo "--- Background Jobs sans gestion d'erreur ---"
for job in src/Riada.Infrastructure/BackgroundJobs/*.cs; do
    has_try=$(grep -c "try" "$job" 2>/dev/null)
    has_catch=$(grep -c "catch" "$job" 2>/dev/null)
    [ "$has_try" -lt 1 ] && echo "  ❌ $(basename $job) : pas de try-catch → crash silencieux possible"
done

# Jobs non enregistrés dans DI → jamais exécutés
echo ""
echo "--- Background Jobs non enregistrés ---"
for job in $(find src/Riada.Infrastructure/BackgroundJobs -name '*.cs' -exec basename {} .cs \;); do
    grep -q "$job" src/Riada.API/Program.cs 2>/dev/null || echo "  ❌ $job → pas dans Program.cs"
done

# SaveChangesAsync manquant après Update
echo ""
echo "--- Updates sans SaveChangesAsync ---"
grep -rn "\.Update(" src/Riada.Application/UseCases/ --include="*.cs" -A5 2>/dev/null | grep -B5 "Update(" | grep -L "SaveChangesAsync" | head -5
```

**Dimension 4 — Prévisibilité**

```bash
echo "═══ RISK: PRÉVISIBILITÉ ═══"

# EF Migrations → comportement imprévisible en database-first
grep -rn "Database.Migrate\|Database.EnsureCreated\|AddDbContextFactory" src/Riada.API/Program.cs 2>/dev/null && echo "  ❌ EF Migrations détectées → INTERDIT en database-first" || echo "  ✅ Pas de migrations EF"

# Secrets hardcodés → comportement imprévisible en prod
echo ""
echo "--- Secrets par défaut détectés ---"
grep -n "CHANGE_THIS\|YOUR_PASSWORD\|your-secret\|changeme" src/Riada.API/appsettings*.json 2>/dev/null && echo "  ❌ Secrets par défaut → changer avant prod"
```

---

## Complexity Evaluator

### Identity
Tu évalues la complexité et proposes un découpage. Tu appliques le principe anti-**Lost-in-the-Middle** : ne jamais surcharger un agent avec un contexte massif. Diviser en étapes atomiques.

### Métriques de complexité

```bash
#!/bin/bash
set -euo pipefail

echo "═══ COMPLEXITY METRICS ═══"

echo "--- Top 10 fichiers les plus longs (risque de Lost-in-the-Middle si injectés en contexte) ---"
find src/ -name '*.cs' -exec sh -c 'echo "$(wc -l < "$1") $1"' _ {} \; | sort -rn | head -10

echo ""
echo "--- Profondeur d'injection constructeur (complexité couplage) ---"
for uc in src/Riada.Application/UseCases/**/*.cs; do
    deps=$(grep -c "private readonly" "$uc" 2>/dev/null)
    [ "$deps" -gt 4 ] && echo "  ⚠️  $(basename $uc): $deps dépendances (>4 → considérer decomposition)"
done

echo ""
echo "--- Ratio code/test (objectif > 0.5) ---"
code_lines=$(find src/ -name '*.cs' -exec cat {} + 2>/dev/null | wc -l)
test_lines=$(find tests/ -name '*.cs' -exec cat {} + 2>/dev/null | wc -l)
ratio=$(echo "scale=2; $test_lines / $code_lines" | bc 2>/dev/null || echo "N/A")
echo "  Code: $code_lines lignes, Tests: $test_lines lignes, Ratio: $ratio"
```

### Template de découpage (Progressive Disclosure)

```
TÂCHE: [description]
COMPLEXITÉ: [faible ≤3 fichiers | moyenne 4-8 | élevée >8]
TOKENS ESTIMÉS: [estimation du contexte nécessaire]

DÉCOUPAGE PROGRESSIF:
  Étape 1 (Niveau 1 — Découverte): 
    → Lire les fichiers existants impactés
    → Identifier les dépendances
    → Validation: aucune (lecture seule)
  
  Étape 2 (Niveau 2 — Implémentation):
    → Créer/modifier les fichiers
    → Validation: dotnet build
  
  Étape 3 (Niveau 3 — Intégration):
    → Enregistrer dans DI
    → Ajouter endpoint si nécessaire
    → Validation: dotnet build && dotnet test

RISQUES: [ce qui peut casser]
ROLLBACK: git checkout -- [fichiers modifiés]
```
