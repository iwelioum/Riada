# 🧠 RIADA AI Agents v3 — Production-Grade Executable Pack

## Principes académiques intégrés

Cette v3 intègre les concepts du texte de référence sur la fiabilité des architectures logicielles :

| Concept | Où il est appliqué |
|---|---|
| **`set -euo pipefail`** (Bash Strict Mode) | 08-devops : chaque script commence par cette ligne |
| **Programmation défensive** | 03-backend : null-checks constructeur, validation à la frontière |
| **Gestion chirurgicale des exceptions** | 03-backend : jamais de bare catch, capture spécifique |
| **Obfuscation des erreurs client** | 03-backend + 05-frontend : jamais de stack trace au client |
| **Idempotence ACID** | 04-database : SPs transactionnelles, DDL IF NOT EXISTS |
| **Lost-in-the-Middle mitigation** | 09-self-evolution : Skills Architecture, Progressive Disclosure 3 niveaux |
| **Anti-Mega-Prompt** | 09-self-evolution : chaque agent < 300 lignes, chargement sélectif |
| **ReliabilityBench (4 dimensions)** | 06-quality : Cohérence, Robustesse, Tolérance, Prévisibilité |
| **Data-Driven Testing** | 06-quality : [Theory] + [InlineData] au lieu de tests dupliqués |
| **Fault injection** | 06-quality : 13 cas limites documentés |
| **Audit cryptographique** | 07-security : structure du journal RGPD, traçabilité |
| **Human-in-the-Loop** | 01-governance : liste des actions nécessitant approbation |
| **Prompts-as-Code** | 09-self-evolution : versioning Git, revue, rollback |
| **Row-Level Security** | 04-database : recommandations pour accès agents IA |
| **Isolation d'état** (mktemp) | 08-devops : répertoires temporaires uniques |
| **Meaningful Naming** | 03-backend : One Identifier for One Purpose |

## Fichiers

| # | Fichier | Agents | Lignes |
|---|---|---|---|
| 01 | `01-governance-agents.md` | Supreme Architect, Mission Control | ~180 |
| 02 | `02-system-intelligence-agents.md` | Project Analyst, Risk Detection, Complexity Evaluator | ~200 |
| 03 | `03-backend-engineering-agents.md` | C# Domain Engineer, API Architect, Business Logic Guardian, Refactor Engine | ~280 |
| 04 | `04-database-engineering-agents.md` | MySQL Master DBA, Query Optimizer, Data Integrity Guardian | ~220 |
| 05 | `05-frontend-engineering-agents.md` | Angular Component Engineer, UX Mastermind, Frontend Perf | ~200 |
| 06 | `06-quality-engineering-agents.md` | QA Commander, Test Strategy AI, Bug Hunter AI, Regression Guardian | ~280 |
| 07 | `07-security-division-agents.md` | Authentication Guardian, API Security Guardian, Vulnerability Scanner | ~200 |
| 08 | `08-devops-infrastructure-agents.md` | Deployment Commander, Monitoring Agent | ~220 |
| 09 | `09-self-evolution-engine-agents.md` | Research Agent, Architecture Evolution, Self Improvement | ~280 |

## Usage avec Claude Code

```bash
cd Riada
claude
```

**Audit complet :**
> Lis les 9 fichiers dans `agents/`. Exécute d'abord le Project Analyst (02) pour l'inventaire, puis le Risk Detection Agent (02) pour scanner les 4 dimensions ReliabilityBench, puis le Supreme Architect (01) pour l'audit d'architecture. Corrige tous les problèmes P0 et P1 trouvés.

**Agent spécifique :**
> Lis `agents/07-security-division-agents.md` et exécute les 3 audits complets (Authentication + API Security + Vulnerability). Produis un rapport.

**Mission Control workflow :**
> Tu es Mission Control. Tâche : "Ajouter GetAccessLogUseCase avec pagination". Suis le protocole 5 étapes et utilise les agents nécessaires.

## Règles immuables

1. `set -euo pipefail` en tête de chaque script bash
2. Clean Architecture : Domain → 0 dépendance
3. Ne pas modifier `sql/`
4. Dapper pour les 8 SPs (paramètres OUT)
5. Colonnes GENERATED = lecture seule
6. Recharger l'entité après trigger
7. Enum converters = mapping exact snake_case
8. Jamais de bare catch (Exception)
9. Jamais de stack trace au client
10. Human-in-the-Loop pour actions irréversibles
