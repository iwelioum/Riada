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
- ✅ Démarre le mode fullstack (backend + frontend)
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
├── 🌐 frontend/                # Frontend Angular 19 (Standalone)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/          # 10 page components
│   │   │   ├── layout/         # Main layout wrapper
│   │   │   ├── core/           # Services & models
│   │   │   ├── app.routes.ts   # Routing config
│   │   │   └── app.config.ts   # HttpClient provider
│   │   └── styles.scss         # Global design system
│   ├── dist/                   # Production build (ng build)
│   ├── angular.json            # CLI configuration
│   ├── package.json            # Dependencies
│   └── README.md               # Frontend documentation
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
| **Lancer le frontend** | launch.ps1 frontend | `scripts/Launch/` |
| **Lancer fullstack** | launch.ps1 fullstack | `scripts/Launch/` |
| **Code frontend (Angular)** | README.md | `frontend/` |
| **Lancer avec Docker** | docker-compose.yml | `scripts/Docker/` |

---

## ⚡ Commands Rapides

```bash
# Lancer l'API (Windows)
cd scripts\Launch
.\launch.ps1 run
# ou double-clic sur launch.bat

# Lancer le frontend (Windows, Node 24+)
cd frontend
npm install
npm run build && npm run serve:dist   # choisit un port libre (4200+)

# Lancer backend + frontend (Windows) via automation
cd scripts\Launch
.\launch.ps1 fullstack                # build + serve dist côté frontend

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

| Component | Status |
|-----------|--------|
| **Backend** | ✅ Production Ready |
| API Build | ✅ 0 erreurs |
| API Endpoints | ✅ 13+ créés |
| Health Check | ✅ Opérationnel |
| Swagger Docs | ✅ Disponible |
| **Frontend** | ✅ Angular 19 ready (serve:dist) |
| Angular Build | ✅ 0 erreurs (Node 24 compatible) |
| Pages Implémentées | ✅ Dashboard, Members + contrats, Billing, Equipment, Access, Plans, Guests, Statistics |
| Components | ✅ Standalone Angular 19 |
| SCSS Styling | ✅ Design system global |
| API Integration | ✅ Members, Contracts, Billing, Equipment, Access, Plans, Guests, Analytics |
| **Infrastructure** | ✅ Prête |
| Automation Scripts | ✅ PowerShell + Bash |
| Docker Support | ✅ docker-compose |
| Database | ✅ MySQL 8.0+ |

**Status Global:** ✅ **Fullstack Opérationnel**

---

## 🔁 CI/CD Workflows

Pipelines GitHub Actions actifs dans `.github/workflows/` :

- `ci-dotnet.yml` : restore/build/tests .NET + publication d'artefacts
- `ci-angular.yml` : build/tests Angular + artefacts de couverture
- `ci-monitoring.yml` : checks monitoring DB/sécurité (mode CI-safe)
- `ci-docker.yml` : build Docker avec cache Buildx, push GHCR sur `main`

---

## 🌐 Frontend (Angular 19)

**Angular 19 standalone**, compatible **Node 24** : utiliser `npm run build && npm run serve:dist` (choisit un port libre, CORS dev autorisé côté API en environnement Development).

### 📦 Technologies
- **Framework:** Angular 19.2 (Standalone Components)
- **Styling:** SCSS + design system FitMove
- **HTTP:** HttpClient + RxJS (gateway `core/services/api.service.ts`)
- **Routing:** Standalone routes, layout header/sidebar

### ✅ Couverture actuelle
- Membres + contrats (CRUD, freeze/renew)
- Billing (détail, paiement, génération)
- Equipment (liste + tickets maintenance, filtres club/statut)
- Access control (member/guest check)
- Plans/Options, Clubs, Guests
- Analytics (risks, frequency, options, health)
- Dashboard / Classes / Schedule connectés aux APIs
- Exercices/meal/workout/messages/reports/settings : démo/placeholder

### 🏗️ Structure Frontend (résumé)
```
frontend/
├── src/app/
│   ├── app.routes.ts
│   ├── app.config.ts
│   ├── layout/           # wrapper + nav
│   ├── core/             # services + models
│   └── pages/            # domaines (members, billing, equipment, access, plans, guests, analytics…)
└── package.json          # scripts (build, serve:dist)
```

### 🚀 Quick Start (Frontend)
```bash
cd frontend
npm install
npm run build && npm run serve:dist   # sert dist/ avec http-server, port libre dès 4200
```

### 🎨 Design System

Global SCSS variables with consistent theming:
```scss
--primary-color: #6366f1
--secondary-color: #8b5cf6
--success-color: #10b981
--danger-color: #ef4444
--warning-color: #f59e0b
```

Responsive grid layouts, card components, tables, and badges included.

### 🔌 API Integration

All API calls go through **ApiService** (`src/app/core/services/api.service.ts`):

```typescript
// Example usage in components
constructor(private apiService: ApiService) {}

ngOnInit() {
  this.apiService.getMembers().subscribe(
    data => this.members = data,
    error => console.error(error)
  );
}
```

**Configured API URL files:**
- `frontend/src/environments/environment.ts`
- `frontend/src/environments/environment.production.ts`

### 📱 Responsive Design

- Mobile-first SCSS breakpoints
- Collapsible sidebar navigation
- Mobile-friendly tables and cards
- Touch-optimized buttons

### 🔧 Troubleshooting

**Port 4200 in use?**
```bash
# Run on different port
ng serve --port 4300
```

**CORS issues?**
Ensure backend has CORS enabled for `http://localhost:4200`

**Module not found?**
```bash
cd frontend && npm install
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

# Frontend only
cd scripts\Launch
.\launch.ps1 frontend

# Fullstack
cd scripts\Launch
.\launch.ps1 fullstack

# Mac/Linux
cd scripts/Launch && ./launch.sh run

# Docker
cd scripts\Docker && docker compose up --build
```

Puis ouvre:
- API Swagger: https://localhost:7001/swagger
- Frontend: http://localhost:4200
- Fullstack: http://localhost:4200 (avec backend auto)

---

**Version:** 5.1  
**Status:** ✅ Production Ready  
**Tech:** ASP.NET Core 8.0 | MySQL 8.0+ | Clean Architecture

Pour plus d'infos → [`docs/DOCUMENTATION_INDEX.md`](docs/DOCUMENTATION_INDEX.md) 📚
