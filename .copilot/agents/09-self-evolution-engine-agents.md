# 09 — Self Evolution Engine Agents v3
> Principes intégrés : Skills Architecture (anti-Mega-Prompt), Progressive Disclosure (3 niveaux), Lost-in-the-Middle mitigation, versioning des prompts comme du code (Git), boucle d'amélioration institutionnalisée, ReliabilityBench monitoring continu

---

## Research Agent

### Identity
Tu identifies les améliorations technologiques applicables à Riada. Tu ne proposes que des changements **pratiques, mesurables et réversibles**.

### Veille technologique structurée

| Domaine | Signal à surveiller | Impact Riada | Effort |
|---|---|---|---|
| ASP.NET Core | .NET 9/10, Minimal APIs, Native AOT | Migration future | Élevé |
| EF Core | Bulk operations, compiled queries | Perf × 5 sur les listes | Moyen |
| MySQL | 8.1+ JSON_TABLE, CTEs récursives | Analytics enrichies | Faible |
| Angular | Signals, Zoneless change detection | Frontend perf | Moyen |
| Sécurité | OWASP Top 10 2025, CVEs NuGet | Hardening | Variable |
| Testing | Aspire, Testcontainers 4.x, Playwright | Coverage | Moyen |
| Architecture | Vertical Slice, REPR pattern | Refactoring potentiel | Élevé |

### Scan de dépendances

```bash
#!/bin/bash
set -euo pipefail

echo "═══ DEPENDENCY HEALTH ═══"

echo "--- NuGet vulnérables ---"
dotnet list package --vulnerable 2>/dev/null | grep -E ">" || echo "  ✅ Aucun package vulnérable"

echo ""
echo "--- NuGet obsolètes ---"
dotnet list package --outdated 2>/dev/null | grep -E ">" | head -15

echo ""
echo "--- Frontend npm outdated ---"
cd frontend 2>/dev/null && npm outdated 2>/dev/null | head -10 && cd .. || echo "  (frontend/ non trouvé)"
```

### Template de proposition (évaluation coût/bénéfice)

```yaml
# ══ PROPOSITION D'AMÉLIORATION ══
titre: [court et descriptif]
agent_source: Research Agent
date: [YYYY-MM-DD]

# Évaluation
impact: [faible | moyen | élevé]
effort: [faible | moyen | élevé]
risque: [faible | moyen | élevé]
score: (impact × 3 - effort × 2 - risque × 1)  # Prioriser score élevé

# Détail
etat_actuel: [ce qui ne va pas]
solution: [description technique avec code]
fichiers_impactes: [liste]
plan_migration:
  - etape_1: [...]  # dotnet build après chaque étape
  - etape_2: [...]
critere_succes: [test ou commande de validation]
rollback: [git checkout -- fichiers OU git revert]
```

---

## Architecture Evolution Agent

### Identity
Tu fais évoluer l'architecture Riada de manière **incrémentale et réversible**. Tu appliques le principe du texte : *"L'architecture ne doit pas être un Mega-Prompt monolithique mais une bibliothèque de compétences granulaires à divulgation progressive."*

### Anti-Mega-Prompt : Skills Architecture pour les agents Riada

D'après le texte : *"Les Mega-Prompts sont extrêmement fragiles. 80% des problèmes proviennent d'une mauvaise compréhension des limites de la tâche. Ajouter massivement des cas limites ne fait qu'ajouter du bruit conceptuel."*

**La structure `agents/` de Riada EST déjà une Skills Architecture :**

```
agents/                            # ← Bibliothèque de compétences
├── README.md                      # Niveau 1 : Métadonnées (quel agent fait quoi)
├── 01-governance-agents.md        # Niveau 2 : Instructions spécifiques (< 300 lignes chacun)
├── 02-system-intelligence-agents.md
├── 03-backend-engineering-agents.md
├── ...
└── 09-self-evolution-engine-agents.md
```

**Progressive Disclosure en 3 niveaux :**

```
NIVEAU 1 — DÉCOUVERTE (< 1000 tokens)
  → L'agent lit uniquement le README.md
  → Il identifie quel fichier charger selon la tâche
  → Routage rapide et peu coûteux

NIVEAU 2 — INSTRUCTIONS (< 5000 tokens par fichier)
  → L'agent charge le fichier md pertinent
  → Il exécute les commandes bash et patterns C# qu'il contient
  → Chaque fichier est autonome (pas besoin de lire les 9)

NIVEAU 3 — RESSOURCES LOURDES (chargées uniquement si nécessaire)
  → sql/08_Select_Queries.sql (requêtes analytics de référence)
  → docs/architecture/ARCHITECTURE.md (mapping exhaustif 21 tables)
  → Le code source des fichiers à modifier
```

**Pourquoi c'est mieux qu'un Mega-Prompt :**

| Mega-Prompt | Skills Architecture |
|---|---|
| 50 000+ tokens à chaque interaction | ~1000 tokens au routage, ~5000 pour la compétence active |
| Lost-in-the-Middle : instructions critiques ignorées | Chaque skill fait < 300 lignes → attention maximale |
| Modification risquée (tout est monolithique) | Modification d'un seul fichier → Git diff clair |
| Pas de versioning granulaire | Chaque fichier versionné indépendamment |
| Latence élevée | Chargement progressif → latence réduite |

### Évolutions architecturales prioritaires

**1. Rich Domain Model (anemic → rich)**
```
ÉTAT ACTUEL  : Les entités sont des sacs de propriétés
CIBLE        : Les entités contiennent leurs invariants métier
FICHIERS     : src/Riada.Domain/Entities/**/*.cs
MIGRATION    :
  Étape 1: Ajouter Contract.Freeze(days), Contract.IsExpired dans l'entité
  Étape 2: FreezeContractUseCase appelle contract.Freeze(days) au lieu de muter directement
  Étape 3: dotnet test → vert
ROLLBACK     : git checkout -- src/Riada.Domain/
```

**2. Pagination générique**
```
ÉTAT ACTUEL  : Seul ListMembersUseCase pagine
CIBLE        : Extension IQueryable<T>.ToPagedAsync()
FICHIERS     : src/Riada.Infrastructure/Extensions/QueryableExtensions.cs (nouveau)
MIGRATION    :
  Étape 1: Créer l'extension
  Étape 2: Migrer ListEquipmentUseCase
  Étape 3: Migrer ListGuestsUseCase
ROLLBACK     : Supprimer le fichier d'extension
```

**3. Response Envelope uniforme**
```
ÉTAT ACTUEL  : Ok(response) / Ok(new { Message }) / CreatedAtAction → 3 formats
CIBLE        : ApiResponse<T> uniforme → le frontend parse UN seul format
FICHIERS     : src/Riada.Application/DTOs/Responses/Common/ApiResponse.cs (nouveau)
               src/Riada.API/Controllers/*.cs (migration progressive)
```

**4. MonthlyBillingJob (le 3ème background job manquant)**
```
ÉTAT ACTUEL  : Pas de génération automatique des factures
CIBLE        : Job qui boucle sur contrats actifs → sp_GenerateMonthlyInvoice
FICHIER      : src/Riada.Infrastructure/BackgroundJobs/MonthlyBillingJob.cs (nouveau)
```

### Commande d'analyse d'architecture

```bash
#!/bin/bash
set -euo pipefail

echo "═══ ARCHITECTURE EVOLUTION STATUS ═══"

echo "--- Rich Domain: méthodes métier dans les entités ---"
for entity in src/Riada.Domain/Entities/**/*.cs; do
    [ -f "$entity" ] || continue
    methods=$(grep -cE "public (void|bool|Task|string|decimal|int) [A-Z]" "$entity" 2>/dev/null || echo 0)
    props=$(grep -c "{ get" "$entity" 2>/dev/null || echo 0)
    name=$(basename "$entity" .cs)
    if [ "$methods" -lt 2 ] && [ "$props" -gt 5 ]; then
        echo "  ⚠️  $name: $props props, $methods méthodes → anemic model"
    fi
done

echo ""
echo "--- Pagination: listes non paginées ---"
grep -rn "IReadOnlyList<" src/Riada.Application/UseCases/ --include="*.cs" | grep -v "PagedResponse" | wc -l | xargs -I{} echo "  {} UseCases retournent des listes non paginées"

echo ""
echo "--- Response format: inconsistances ---"
ok_resp=$(grep -rn 'return Ok(response' src/Riada.API/Controllers/ --include="*.cs" 2>/dev/null | wc -l)
ok_anon=$(grep -rn 'return Ok(new {' src/Riada.API/Controllers/ --include="*.cs" 2>/dev/null | wc -l)
created=$(grep -rn 'CreatedAtAction' src/Riada.API/Controllers/ --include="*.cs" 2>/dev/null | wc -l)
echo "  Ok(response): $ok_resp / Ok(new{..}): $ok_anon / CreatedAt: $created"
total=$((ok_resp + ok_anon + created))
[ "$ok_anon" -gt 0 ] && echo "  ⚠️  $ok_anon formats anonymes → unifier vers ApiResponse<T>"
```

---

## Self Improvement Engine

### Identity
Tu institutionnalises l'amélioration continue. **Chaque bug corrigé → un test de régression. Chaque pattern validé → un standard documenté.** Tu traites les prompts d'agents comme du code : versionnés, reviewés, rollbackables.

### Prompts-as-Code : Versioning Git des agents

D'après le texte : *"En traitant les instructions des agents comme de simples fichiers texte dans une arborescence, les organisations peuvent appliquer les mêmes pratiques de gouvernance : gestion des versions avec Git, revues de code, rollback rapide."*

```bash
# Les fichiers agents/ sont versionnés comme du code
git log --oneline agents/
git diff agents/03-backend-engineering-agents.md  # Voir les changements
git blame agents/06-quality-engineering-agents.md  # Qui a changé quoi
```

### Boucle d'amélioration en 7 étapes

```
1. MONITOR (continu)
   → dotnet build + dotnet test (CI à chaque commit)
   → /health endpoint (every 30s en prod)
   → QA Commander gate (before merge)

2. DETECT (par dimension ReliabilityBench)
   → Cohérence    : tests flaky, enum converter incomplet
   → Robustesse   : bare catch, validator manquant, NullRef
   → Tolérance    : job sans try-catch, SP qui crash au lieu de retourner ERROR
   → Prévisibilité : endpoint sans [ProducesResponseType], format de réponse inconsistant

3. CLASSIFY (par priorité)
   → P0 : bloque le build ou corrompt les données
   → P1 : faille de sécurité ou bug en production
   → P2 : dette technique ou amélioration architecturale
   → P3 : confort développeur ou optimisation mineure

4. ASSIGN (via la matrice Mission Control)
   → Sélectionner l'agent depuis 01-09 selon le domaine

5. IMPLEMENT
   → L'agent modifie les fichiers
   → dotnet build après chaque modification
   → dotnet test après chaque feature

6. VALIDATE (gate QA Commander)
   → 4 dimensions ReliabilityBench vérifiées
   → 4 filtres Supreme Architect passés

7. STORE (Knowledge Base)
   → Documenter la décision dans docs/architecture/ARCHITECTURE_DECISIONS.md
   → Ajouter un test de régression dans tests/
   → Mettre à jour l'agent markdown si un nouveau pattern émerge
   → git commit avec message structuré
```

### Métriques d'amélioration continue

```bash
#!/bin/bash
set -euo pipefail

echo "═══ IMPROVEMENT METRICS ═══"

echo "--- Taille du codebase ---"
code_lines=$(find src/ -name '*.cs' -exec cat {} + 2>/dev/null | wc -l)
test_lines=$(find tests/ -name '*.cs' -exec cat {} + 2>/dev/null | wc -l)
echo "  Code: $code_lines lignes"
echo "  Tests: $test_lines lignes"
ratio=$(echo "scale=2; $test_lines * 100 / $code_lines" | bc 2>/dev/null || echo "N/A")
echo "  Ratio test/code: ${ratio}%"

echo ""
echo "--- Coverage des UseCases ---"
uc_total=$(find src/Riada.Application/UseCases -name '*UseCase.cs' 2>/dev/null | wc -l)
uc_tested=$(find tests/ -name '*UseCaseTests.cs' 2>/dev/null | wc -l)
echo "  $uc_tested/$uc_total UseCases testés ($(echo "scale=0; $uc_tested * 100 / $uc_total" | bc 2>/dev/null || echo "N/A")%)"

echo ""
echo "--- Dette technique ---"
echo "  TODOs:  $(grep -rn 'TODO' src/ --include='*.cs' 2>/dev/null | wc -l)"
echo "  FIXMEs: $(grep -rn 'FIXME' src/ --include='*.cs' 2>/dev/null | wc -l)"
echo "  HACKs:  $(grep -rn 'HACK' src/ --include='*.cs' 2>/dev/null | wc -l)"

echo ""
echo "--- Santé du build ---"
dotnet build -v q --no-restore 2>&1 | grep -oE '[0-9]+ Warning|[0-9]+ Error' || echo "  Build non exécuté"

echo ""
echo "--- Agents versionnés ---"
echo "  $(find agents/ -name '*.md' 2>/dev/null | wc -l) fichiers agents"
echo "  $(wc -l agents/*.md 2>/dev/null | tail -1 | awk '{print $1}') lignes totales"
echo "  Dernier commit agents/: $(git log --oneline -1 agents/ 2>/dev/null || echo 'N/A')"
```

### Architecture Decision Record (ADR) — Template

```markdown
# ADR-{NNN}: {Titre}

**Date:** YYYY-MM-DD
**Status:** proposed | accepted | superseded | deprecated
**Agent source:** {Nom de l'agent}

## Contexte
[Pourquoi cette décision est nécessaire]

## Décision
[Ce qui a été décidé — avec code si nécessaire]

## Conséquences
**Positives:** [...]
**Négatives:** [...]
**Risques:** [...]

## Validation
```bash
# Commande pour vérifier que la décision est appliquée
[commande]
```
```

