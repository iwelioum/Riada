# 📦 Riada API - Manifest des Fichiers d'Automatisation

**Version:** 1.0  
**Date:** Décembre 2024  
**Status:** ✅ Production Ready

---

## 📋 Inventaire Complet

### 🚀 Scripts d'Exécution

#### 1. `run.bat` (Windows - Simple)
- **Taille:** 2.5 KB
- **Plateforme:** Windows uniquement
- **Exécution:** Double-clic ou `run.bat`
- **Contenu:**
  - Vérification de .NET SDK
  - Restauration des dépendances
  - Compilation du projet
  - Lancement de l'API
  - Messages d'aide
- **Avantages:** Simplicité maximale, pas de configuration
- **Utilisateurs cibles:** Débutants, non-techniciens

#### 2. `run.ps1` (Windows - Avancé)
- **Taille:** 7.1 KB
- **Plateforme:** Windows (PowerShell 5.0+)
- **Exécution:** `.\run.ps1 [option]`
- **Options:**
  ```
  (aucune)   → Lancement complet
  --restore  → Seulement restauration
  --build    → Seulement compilation
  --run      → Seulement exécution
  --test     → Exécuter les tests
  --release  → Build optimisé
  --clean    → Nettoyer bin/obj
  --help     → Afficher l'aide
  ```
- **Avantages:** Granularité, contrôle, messages colorés
- **Utilisateurs cibles:** Développeurs Windows

#### 3. `Makefile` (Mac/Linux)
- **Taille:** 5 KB
- **Plateforme:** Mac/Linux (requiert `make`)
- **Exécution:** `make [target]`
- **Targets:**
  ```
  make help      → Affiche l'aide
  make restore   → Restauration
  make build     → Compilation
  make run       → Exécution complète
  make test      → Tests
  make clean     → Nettoyage
  make watch     → Mode watch
  make release   → Build Release
  make swagger   → Ouvre Swagger
  make health    → Test /health
  ```
- **Avantages:** Standard Unix, très efficace
- **Utilisateurs cibles:** Développeurs Mac/Linux

---

### 🐳 Docker & Containerisation

#### 4. `Dockerfile` (Multi-stage Build)
- **Taille:** 1.3 KB
- **Stage 1:** Builder (.NET SDK)
  - Restauration des dépendances
  - Build Release
  - Publish de l'application
- **Stage 2:** Runtime (.NET Runtime)
  - Image minimale pour exécution
  - Expose ports 5275, 5174
  - Health check inclus
- **Avantages:**
  - Images légères (multi-stage)
  - Prêt pour production
  - Facile à déployer

#### 5. `docker-compose.yml` (Orchestration)
- **Taille:** 1.2 KB
- **Services:**
  - **mysql:** MySQL 8.0 avec initialisation
  - **api:** Riada API
- **Volumes:**
  - `mysql-data` pour persistance
  - `./sql` pour scripts d'init
- **Networks:** `riada-network` pour communication
- **Health Checks:** Inclus
- **Avantages:**
  - API + MySQL en un clic
  - Isolation complète
  - Configuration centralisée

---

### 📚 Documentation

#### 6. `AUTOMATION_GUIDE.md` (Guide Complet)
- **Taille:** 5.4 KB
- **Contenu:**
  - Explication de chaque script
  - Comment les utiliser
  - Comparaison et recommandations
  - Dépannage (troubleshooting)
  - Performance tips
- **Public:** Tous les utilisateurs

#### 7. `README.md` (Mise à Jour)
- **Changements:** Ajout section "Quick Start"
- **Contenu:** Référence aux scripts d'automatisation

---

## 🎯 Matrice d'Utilisation

| Situation | Script | Commande | Avantages |
|-----------|--------|----------|-----------|
| Débutant Windows | `run.bat` | Double-clic | Simplicité |
| Dev Windows | `run.ps1` | `.\run.ps1` | Contrôle |
| Dev Mac/Linux | `Makefile` | `make run` | Standard |
| Production | `docker-compose` | `docker-compose up` | Isolation |
| CI/CD | `docker-compose` | Intégration | Reproductibilité |

---

## 📊 Fichiers Générés par les Scripts

### Lors de l'exécution:
```
bin/
├── Debug/
│   └── net8.0/
│       ├── Riada.API.dll
│       ├── Riada.Application.dll
│       ├── Riada.Domain.dll
│       ├── Riada.Infrastructure.dll
│       └── ... (dependencies)
└── Release/ (si --release)

obj/
├── Debug/
│   └── net8.0/
└── Release/

src/Riada.API/bin/Debug/net8.0/
└── (runtime binaries)
```

### Output Docker:
```
riada-api          # Image taggée
riada-api:latest   # Latest tag
riada-mysql        # Container MySQL
riada-api          # Container API
```

---

## 🔒 Sécurité

### Considérations:
1. **Secrets:**
   - `appsettings.Development.json` → .gitignore
   - JWT SecretKey → variables d'environnement
   - MySQL Password → variables d'environnement (Docker)

2. **Permissions:**
   - PowerShell: Peut nécessiter Set-ExecutionPolicy
   - Makefile: Aucune permission spéciale requise
   - Docker: Requiert Docker daemon

3. **Ports:**
   - 5275 (HTTPS API)
   - 5174 (HTTP fallback)
   - 3306 (MySQL, Docker seulement)

---

## 📈 Performance

### Temps d'exécution typiques:
```
run.bat ou run.ps1:     ~30-45 secondes (restore + build + run)
make run:               ~30-45 secondes
docker-compose up:      ~60-90 secondes (première fois)
```

### Optimisations:
```
# Rebuild sans restauration:
.\run.ps1 --build       # Plus rapide

# Compilation optimisée:
.\run.ps1 --release     # Build Release (plus lent, plus rapide à run)

# Mode watch (développement):
make watch              # Rechargement automatique
```

---

## 🐛 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| "dotnet not found" | Installer .NET 8.0 SDK |
| "Port 5275 in use" | Tuer le processus existant |
| "PowerShell execution policy" | `Set-ExecutionPolicy RemoteSigned` |
| "MySQL connection failed" | Vérifier MySQL est lancé |
| "Docker permission denied" | Ajouter utilisateur à groupe docker |

Voir `AUTOMATION_GUIDE.md` pour détails complets.

---

## ✅ Vérification Pré-Lancement

Avant d'utiliser les scripts:

```bash
# 1. Vérifier .NET
dotnet --version       # Doit afficher 8.0.0+

# 2. Vérifier MySQL (sauf Docker)
mysql --version        # Doit afficher 8.0+

# 3. Vérifier ports disponibles
netstat -ano | findstr :5275   # Windows
lsof -i :5275                  # Mac/Linux

# 4. Vérifier espace disque
df -h                  # Au moins 5GB libre
```

---

## 🎯 Prochaines Étapes

Après lancement réussi:

1. **Swagger UI:** https://localhost:5275/swagger
2. **Health Check:** https://localhost:5275/health
3. **Tester un endpoint:** GET /api/members
4. **Voir logs:** Dans la console du terminal
5. **Modifier code:** Changements chauds avec `make watch`

---

## 📞 Support

- **Questions sur les scripts:** Voir `AUTOMATION_GUIDE.md`
- **Questions sur l'API:** Voir `README.md`
- **Questions sur l'architecture:** Voir `ARCHITECTURE.md`
- **Rapport complet:** Voir `EXECUTION_REPORT.md`

---

## 📝 Maintenance

### Mise à jour des scripts:
1. Modifier le script (ex: `run.ps1`)
2. Tester localement
3. Commit et push sur Git

### Ajout de nouveaux scripts:
1. Créer le fichier (ex: `setup.ps1`)
2. Ajouter au `.gitignore` si nécessaire
3. Documenter dans `AUTOMATION_GUIDE.md`

---

**Créé:** Décembre 2024  
**Status:** ✅ Prêt pour Production  
**Mainteneur:** Copilot CLI  
**Version:** 1.0
