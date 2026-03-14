# 🏋️ Riada - Système de Gestion de Salles de Sport (API ASP.NET Core 8)

![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8.0-blueviolet.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)
![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-green.svg)
![EF Core](https://img.shields.io/badge/EF%20Core-Pomelo-orange.svg)
![Status](https://img.shields.io/badge/Status-Build%20Passing-brightgreen.svg)

---

## 🚀 Démarrage Rapide (30 secondes)

### ⚡ Le Plus Simple (Windows)
**Double-clic sur:** `scripts/Launch/launch.bat`
- ✅ Auto-détecte le projet
- ✅ Restore → Build → Run automatique
- ✅ Affiche les erreurs clairement

### 🎯 Autres Méthodes

**Windows (avec Raccourci)**
```bash
# Double-clic sur pour créer un raccourci sur le Bureau
scripts/Launch/CREATE_SHORTCUT.cmd
```

**Mac/Linux**
```bash
cd scripts/Launch
./launch.sh
```

**Docker**
```bash
cd scripts/Docker
docker-compose up
```

👉 **Guide complet:** [`scripts/Launch/README.md`](scripts/Launch/README.md)

---

## 📂 Structure du Projet

```
Riada/
├── 📚 docs/                    # Toute la documentation
│   ├── QUICK_START.md          # Démarrage 30 secondes
│   ├── DOCUMENTATION_INDEX.md  # Index central (point d'entrée)
│   ├── README_ORIGINAL.md      # Documentation complète
│   ├── ARCHITECTURE.md         # Schéma BD et design
│   ├── AUTOMATION_GUIDE.md     # Guide des scripts
│   ├── AUTOMATION_MANIFEST.md  # Détails techniques
│   └── ... (autres documentations)
│
├── 🤖 scripts/                 # Scripts d'automatisation
│   ├── Launch/
│   │   ├── launch.bat          # 🚀 LANCER L'API (Windows - Double-clic)
│   │   ├── launch.ps1          # Lancer l'API (Windows PowerShell)
│   │   ├── launch.sh           # Lancer l'API (Mac/Linux)
│   │   ├── CREATE_SHORTCUT.cmd # Créer raccourci Bureau
│   │   └── README.md           # Guide complet
│   ├── Docker/                 # Dockerfile et docker-compose
│   ├── Config/                 # Configuration (config.json, .env)
│   ├── Utilities/              # Modules réutilisables
│   └── README.md               # Documentation scripts
│
├── 💻 src/                     # Code source
│   ├── Riada.Domain/
│   ├── Riada.Application/
│   ├── Riada.Infrastructure/
│   └── Riada.API/
│
├── 🧪 tests/                   # Tests
│
├── 🗄️ sql/                     # Scripts MySQL
│
└── Riada.sln                   # Solution Visual Studio
```

---

## 🎯 Où Chercher Quoi?

| Besoin | Fichier | Chemin |
|--------|---------|--------|
| **Démarrer rapidement** | QUICK_START.md | `docs/` |
| **Vue d'ensemble** | README_ORIGINAL.md | `docs/` |
| **Documentation centralisée** | DOCUMENTATION_INDEX.md | `docs/` |
| **Schéma de la BD** | ARCHITECTURE.md | `docs/` |
| **Guide des scripts** | AUTOMATION_GUIDE.md | `docs/` |
| **Lancer l'API (Windows)** | launch.bat / launch.ps1 | `scripts/Launch/` |
| **Lancer l'API (Mac/Linux)** | launch.sh | `scripts/Launch/` |
| **Lancer avec Docker** | docker-compose.yml | `scripts/Docker/` |

---

## ⚡ Commands Rapides

```bash
# Lancer l'API (Windows)
cd scripts\Launch
.\launch.ps1 run
# ou double-clic sur launch.bat

# Lancer l'API (Mac/Linux)
cd scripts/Launch
./launch.sh run

# Docker
cd scripts\Docker
docker compose up --build

# Tests des scripts de lancement
cd scripts\Launch
test.bat
```

---

## 📊 Statut

| Phase | Status |
|-------|--------|
| Build | ✅ 0 erreurs |
| UseCases | ✅ 12 créés |
| DI | ✅ Complète |
| Endpoints | ✅ 13 créés |
| Validation | ✅ Complète |
| Tests | ✅ 2/2 passants |
| Polish | ✅ Complet |

**Status Final:** ✅ **Production Ready**

---

## 🌐 Endpoints Principaux

```
GET    /api/members              # Lister
GET    /api/members/{id}         # Détails
POST   /api/members              # Créer

GET    /api/contracts/{id}       # Détails
GET    /api/billing/invoices/{id}# Détails

GET    /health                   # Health check
GET    /swagger                  # Documentation interactive
```

---

## 📚 Documentation Complète

Tous les guides sont dans le dossier [`docs/`](docs/) :

- **[QUICK_START.md](docs/QUICK_START.md)** - Démarrage 30 sec
- **[DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** - Index central
- **[README_ORIGINAL.md](docs/README_ORIGINAL.md)** - Vue complète
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Schéma BD
- **[AUTOMATION_GUIDE.md](docs/AUTOMATION_GUIDE.md)** - Guides scripts
- **[PATTERN_GUIDE.md](docs/PATTERN_GUIDE.md)** - Patterns
- **[EXECUTION_REPORT.md](docs/EXECUTION_REPORT.md)** - Rapport

---

## 🚀 Lancer Maintenant!

```bash
# Windows
cd scripts\Launch
.\launch.ps1 run

# Mac/Linux
cd scripts/Launch && ./launch.sh run

# Docker
cd scripts\Docker && docker compose up --build
```

Puis ouvre: https://localhost:5275/swagger

---

**Version:** 5.1  
**Status:** ✅ Production Ready  
**Tech:** ASP.NET Core 8.0 | MySQL 8.0+ | Clean Architecture

Pour plus d'infos → [`docs/DOCUMENTATION_INDEX.md`](docs/DOCUMENTATION_INDEX.md) 📚
