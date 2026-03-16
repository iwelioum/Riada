# 📚 Riada API - Index de Documentation Complet

**Version:** 5.2  
**Statut:** ✅ Production Ready  
**Dernière mise à jour:** Mars 2026 (Cycle 7 sync)

---

## 🚀 Démarrer Rapidement

### 👶 **Pour les Débutants**
1. **Première lecture:** [`QUICK_START.md`](#quick-startmd)
2. **Lancer l'API:** Double-clic sur `run.bat`
3. **Accéder à Swagger:** https://localhost:5275/swagger

### 💻 **Pour les Développeurs**
1. **Comprendre l'archi:** Lire [`ARCHITECTURE.md`](#architecturemd)
2. **Lancer l'API:** `.\run.ps1` ou `make run`
3. **Modifier du code:** Voir [`PATTERN_GUIDE.md`](#pattern-guidemd)

### 🚀 **Pour les DevOps**
1. **Lire:** [`AUTOMATION_GUIDE.md`](#automation-guidemd)
2. **Monitoring:** [`MONITORING_OPERABILITY.md`](#monitoring_operabilitymd)
3. **Qualité continue:** Workflow `ci-quality-gates.yml`
4. **Déployer:** `docker-compose up`
5. **Monitorer:** Accès à `/health` + scripts monitoring cycle 4

---

## 📄 Fichiers de Documentation

### **QUICK_START.md** ⚡
- **Durée:** 2 min de lecture
- **Pour:** Commencer en 30 secondes
- **Contient:**
  - Setup initial
  - Commandes pour lancer l'API
  - Endpoints principaux
  - Troubleshooting basique
- **→ [Voir le fichier](./QUICK_START.md)**

### **README.md** 📖
- **Durée:** 5-10 min de lecture
- **Pour:** Comprendre le projet
- **Contient:**
  - Description générale
  - Statut des cycles multi-agents
  - Fonctionnalités principales
  - Architecture générale
  - Installation MySQL
  - Configuration JWT
  - Endpoints majeurs
- **→ [Voir le fichier](./README.md)**

### **ARCHITECTURE.md** 🏗️
- **Durée:** 10-15 min de lecture
- **Pour:** Comprendre le design
- **Contient:**
  - Schéma de la base de données (19 tables)
  - Enums et types
  - Relations (1-N, N-N)
  - Entités (Members, Contracts, Billing, etc.)
  - Stored Procedures (8 SPs)
  - Triggers (28 triggers)
  - Validation business rules
- **→ [Voir le fichier](./ARCHITECTURE.md)**

### **CLAUDE_CODE_INSTRUCTIONS.md** 📋
- **Durée:** 3-5 min de lecture
- **Pour:** Comprendre les 7 phases implémentées
- **Contient:**
  - Phase 1: Build propre
  - Phase 2: UseCases
  - Phase 3: Dependency Injection
  - Phase 4: Controllers & Endpoints
  - Phase 5: Validation & Error Handling
  - Phase 6: Tests
  - Phase 7: Polish (Swagger, CORS, Health Check)
- **→ [Voir le fichier](./CLAUDE_CODE_INSTRUCTIONS.md)**

### **AUTOMATION_GUIDE.md** 🤖
- **Durée:** 5 min de lecture
- **Pour:** Automatiser le lancement
- **Contient:**
  - Explications des 6 scripts d'automatisation
  - Syntaxe et options pour chaque script
  - Comparaison (Windows, Mac/Linux, Docker)
  - Troubleshooting détaillé
  - Performance tips
- **→ [Voir le fichier](./AUTOMATION_GUIDE.md)**

### **MONITORING_OPERABILITY.md** 📈
- **Durée:** 3-5 min de lecture
- **Pour:** Exécuter les checks DB/sécurité en local et en CI
- **Contient:**
  - SQL runtime checks (DB + security health)
  - Scripts PowerShell de monitoring
  - Variables d'environnement DB
  - Artifacts de sortie (`artifacts/monitoring/`)
  - Workflow CI dédié monitoring
- **→ [Voir le fichier](./MONITORING_OPERABILITY.md)**

### **PERFORMANCE_BASELINE.md** ⚡
- **Durée:** 3-5 min de lecture
- **Pour:** Suivre les objectifs performance front/API et les seuils Cycle 6
- **Contient:**
  - Baseline FCP/LCP/CLS
  - Cibles de bundle et mémoire
  - Opportunités d'optimisation priorisées
  - Référentiel utilisé par le gate perf CI
- **→ [Voir le fichier](./PERFORMANCE_BASELINE.md)**

### **SECURITY_PENETRATION_TEST_REPORT.md** 🔐
- **Durée:** 8-12 min de lecture
- **Pour:** Visualiser les findings sécurité et la remédiation par cycle
- **Contient:**
  - Couverture endpoint et résultats de tests
  - Classification des risques (Critical/High/Medium/Low)
  - Correctifs livrés et risques résiduels
  - Recommandations pour cycles suivants
- **→ [Voir le fichier](./SECURITY_PENETRATION_TEST_REPORT.md)**

### **AUTOMATION_MANIFEST.md** 📦
- **Durée:** 5 min de lecture
- **Pour:** Détails techniques des scripts
- **Contient:**
  - Inventaire de chaque fichier
  - Contenu et options détaillés
  - Matrice d'utilisation
  - Sécurité
  - Fichiers générés
  - Maintenance
- **→ [Voir le fichier](./AUTOMATION_MANIFEST.md)**

### **EXECUTION_REPORT.md** 📊
- **Durée:** 3-5 min de lecture
- **Pour:** Voir le statut d'exécution final
- **Contient:**
  - Résumé des 7 phases
  - Statistiques finales
  - Build status
  - Test results
  - Délivrables
  - Points forts
- **→ [Voir le fichier](./EXECUTION_REPORT.md)**

### **PHASE_COMPLETION_CHECKLIST.md** ✅
- **Durée:** 5-10 min de lecture
- **Pour:** Vérifier que tout est complet
- **Contient:**
  - Checklist détaillée pour chaque phase
  - UseCases créés
  - Endpoints implémentés
  - Tests réussis
  - Configuration polish
  - Métriques finales
- **→ [Voir le fichier](./PHASE_COMPLETION_CHECKLIST.md)**

### **PATTERN_GUIDE.md** 🎨
- **Durée:** 2 min de lecture
- **Pour:** Appliquer les patterns du projet
- **Contient:**
  - UseCase pattern
  - DTO pattern
  - Repository pattern
  - Validation pattern
  - Exception handling
- **→ [Voir le fichier](./PATTERN_GUIDE.md)**

### **ai-agents/README.md** 🤖
- **Duree:** 3-5 min de lecture
- **Pour:** Voir les definitions des agents IA du master prompt v2
- **Contient:**
  - Gouvernance (Supreme Architect, Mission Control)
  - Agents techniques par domaine (backend, database, frontend, quality, security, devops)
  - Self evolution engine
- **→ [Voir le dossier](./ai-agents/README.md)**

---

## 🔧 Scripts d'Automatisation

### **run.bat** (Windows - Simple)
```bash
Double-clic sur run.bat
```
- Lance tout automatiquement
- Aucune configuration requise
- Idéal pour débutants

### **run.ps1** (Windows - Avancé)
```powershell
.\run.ps1                # Lancement complet
.\run.ps1 --build        # Seulement compiler
.\run.ps1 --test         # Exécuter tests
.\run.ps1 --help         # Voir toutes les options
```
- Contrôle granulaire
- Options multiples
- Messages colorés

### **Makefile** (Mac/Linux)
```bash
make run                 # Lancement complet
make test                # Exécuter tests
make clean build         # Nettoyer et compiler
make help                # Voir toutes les targets
```
- Standard Unix/Linux
- Très efficace
- Largement utilisé

### **docker-compose.yml** (Docker)
```bash
docker-compose up        # Lance API + MySQL
docker-compose down      # Arrête les containers
```
- API + MySQL ensemble
- Isolation complète
- Prêt pour production

---

## 📍 Structure du Projet

```
Riada/
├── 📚 Documentation
│   ├── README.md                          # Vue d'ensemble
│   ├── QUICK_START.md                     # Démarrage 30s
│   ├── ARCHITECTURE.md                    # Schéma BD
│   ├── CLAUDE_CODE_INSTRUCTIONS.md        # Les 7 phases
│   ├── AUTOMATION_GUIDE.md                # Guide scripts
│   ├── AUTOMATION_MANIFEST.md             # Détails scripts
│   ├── EXECUTION_REPORT.md                # Rapport final
│   ├── PHASE_COMPLETION_CHECKLIST.md      # Vérification
│   ├── PATTERN_GUIDE.md                   # Patterns
│   ├── PATTERN_REFERENCE.md               # Références patterns
│   ├── PATTERN_QUICK_REFERENCE.txt        # Cheat sheet
│   ├── USECASE_PATTERN_GUIDE.md           # Pattern UseCase
│   └── DOCUMENTATION_INDEX.md             # Ce fichier
│
├── 🤖 Scripts d'Automatisation
│   ├── run.bat                            # Windows simple
│   ├── run.ps1                            # Windows avancé
│   ├── Makefile                           # Mac/Linux
│   ├── Dockerfile                         # Containerisation
│   └── docker-compose.yml                 # Orchestration
│
├── 💻 Code Source
│   ├── src/
│   │   ├── Riada.Domain/                 # Domain layer
│   │   ├── Riada.Application/            # Application layer
│   │   ├── Riada.Infrastructure/         # Infrastructure layer
│   │   └── Riada.API/                    # API layer
│   └── tests/
│       ├── Riada.UnitTests/              # Unit tests
│       └── Riada.IntegrationTests/       # Integration tests
│
├── 🗄️ Base de Données
│   └── sql/
│       ├── 01-create-schema.sql
│       ├── 02-create-tables.sql
│       ├── 03-create-indexes.sql
│       ├── 04-create-triggers.sql
│       ├── 05-create-stored-procedures.sql
│       └── ... (plus de scripts)
│
└── ⚙️ Configuration
    ├── Riada.sln                         # Solution Visual Studio
    ├── .gitignore                        # Git ignore rules
    └── LICENSE                           # Licence
```

---

## 🎯 Parcours de Lecture Recommandé

### 📈 Progessif (du simple au complexe)

1. **Jour 1 - Démarrage**
   - [ ] Lire `QUICK_START.md` (2 min)
   - [ ] Lancer `run.bat` (1 min)
   - [ ] Accéder à Swagger (1 min)
   
2. **Jour 2 - Compréhension**
   - [ ] Lire `README.md` (10 min)
   - [ ] Lire `AUTOMATION_GUIDE.md` (5 min)
   - [ ] Tester endpoints depuis Swagger (10 min)

3. **Jour 3 - Architecture**
   - [ ] Lire `ARCHITECTURE.md` (15 min)
   - [ ] Lire `PATTERN_GUIDE.md` (5 min)
   - [ ] Explorer le code source (30 min)

4. **Jour 4+ - Développement**
   - [ ] Voir `CLAUDE_CODE_INSTRUCTIONS.md` (5 min)
   - [ ] Lancer `make watch` pour développement (continu)
   - [ ] Écrire du code selon les patterns

---

## 🔄 Flux de Travail Typique

```
┌─────────────────────────────┐
│  1. Lancer l'API            │ → .\run.ps1 ou make run
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  2. Accéder à Swagger       │ → https://localhost:5275/swagger
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  3. Tester endpoints        │ → Utiliser Swagger UI
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  4. Modifier code           │ → Voir PATTERN_GUIDE.md
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  5. Recharger automatique   │ → API recharge avec make watch
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  6. Tester changements      │ → Retour à step 3
└─────────────────────────────┘
```

---

## 💡 Tips Rapides

### 🚀 Démarrage
```bash
# Windows
run.bat

# PowerShell
.\run.ps1

# Mac/Linux
make run

# Docker
docker-compose up
```

### 🧪 Tests
```bash
.\run.ps1 --test
make test
```

### 📚 Documentation
```bash
# Ouvrir Swagger
.\run.ps1 --help

# Voir les targets Make
make help
```

### 🔧 Développement
```bash
# Mode watch (rechargement auto)
make watch

# Build Release (optimisé)
.\run.ps1 --release

# Nettoyer
.\run.ps1 --clean
```

---

## ❓ FAQ Rapide

**Q: Quel script utiliser?**
- Windows débutant → `run.bat`
- Windows dev → `run.ps1`
- Mac/Linux → `make run`
- Production → `docker-compose up`

**Q: Où sont les tests?**
- Tests: `tests/Riada.UnitTests/`
- Lancer: `.\run.ps1 --test` ou `make test`

**Q: Comment ajouter un endpoint?**
- Voir `PATTERN_GUIDE.md` → UseCase pattern
- Suivre les 4 étapes (UseCase, DTO, Repository, Controller)

**Q: Comment déployer en production?**
- Lire `AUTOMATION_GUIDE.md` → Docker section
- Utiliser `docker-compose.yml`

**Q: Où sont les logs?**
- Affichés dans le terminal pendant `dotnet run`
- Configuré en `src/Riada.API/Program.cs`

---

## 📞 Support Rapide

| Question | Où Chercher |
|----------|------------|
| "Comment démarrer?" | `QUICK_START.md` |
| "Comment ça marche?" | `README.md` |
| "Schéma BD?" | `ARCHITECTURE.md` |
| "Patterns?" | `PATTERN_GUIDE.md` |
| "Scripts?" | `AUTOMATION_GUIDE.md` |
| "Détails techniques?" | `EXECUTION_REPORT.md` |
| "Vérification?" | `PHASE_COMPLETION_CHECKLIST.md` |

---

## ✅ Checklist Complète

- [ ] Lire `QUICK_START.md`
- [ ] Lancer l'API avec `run.bat` ou `run.ps1`
- [ ] Accéder à https://localhost:5275/swagger
- [ ] Tester un endpoint
- [ ] Lire `README.md`
- [ ] Lire `ARCHITECTURE.md`
- [ ] Comprendre les patterns (`PATTERN_GUIDE.md`)
- [ ] Exécuter les tests (`make test`)
- [ ] Déployer avec Docker (optionnel)

---

## 🎉 Vous Êtes Prêt!

Tout ce dont vous avez besoin est ici. Choisissez votre point de départ et lancez!

```
🚀 Démarrage simple:          run.bat
💻 Développement:              make run
🐳 Production/Docker:          docker-compose up
📚 Documentation complète:      Voir les fichiers ci-dessus
```

---

**Créé:** Décembre 2024  
**Version:** 5.1  
**Status:** ✅ PRODUCTION READY  
**Auteur:** Copilot CLI

---

*Last Updated: 2024-12-14*  
*For latest changes: git log --oneline*
