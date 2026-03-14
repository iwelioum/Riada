# 🚀 Riada API - Scripts de Lancement Automatisés

Ce dossier contient plusieurs scripts pour lancer facilement le projet Riada selon ta plateforme et tes préférences.

---

## 📋 Options Disponibles

### 1️⃣ **Windows - Simple (Double-clic)**

**Fichier:** `run.bat`

```bash
# Double-clic sur run.bat dans l'explorateur
# OU en command prompt:
run.bat
```

**Ce qu'il fait:**
- ✅ Restaure les dépendances
- ✅ Compile le projet
- ✅ Lance l'API
- ✅ Ouvre les instructions

**Avantages:**
- Plus simple possible
- Aucune configuration requise
- Idéal pour les débutants

---

### 2️⃣ **Windows - Avancé (PowerShell)**

**Fichier:** `run.ps1`

```powershell
# Lancement complet (restore + build + run)
.\run.ps1

# Options disponibles:
.\run.ps1 --restore    # Seulement restore
.\run.ps1 --build      # Seulement build
.\run.ps1 --test       # Exécuter tests
.\run.ps1 --run        # Seulement lancer l'API
.\run.ps1 --release    # Build Release (optimisé)
.\run.ps1 --clean      # Nettoyer bin/obj
.\run.ps1 --help       # Afficher l'aide
```

**Avantages:**
- Flexible et granulaire
- Options multiples
- Messages colorés et informatifs
- Idéal pour les développeurs

**Note:** Si tu as une erreur de sécurité avec PowerShell:
```powershell
# Autoriser l'exécution de scripts (une fois):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 3️⃣ **Mac/Linux - Makefile**

**Fichier:** `Makefile`

```bash
# Lancement complet
make run

# Autres commandes:
make help      # Affiche l'aide
make restore   # Restaure dépendances
make build     # Compile
make test      # Tests
make clean     # Nettoie bin/obj
make watch     # Mode watch (rechargement auto)
make release   # Build Release
make swagger   # Ouvre Swagger
make health    # Teste /health
```

**Avantages:**
- Standard Unix/Linux/Mac
- Très efficace
- Largement utilisé dans l'industrie

---

### 4️⃣ **Docker (Tous les systèmes)**

**Fichiers:** `Dockerfile` + `docker-compose.yml`

#### Option A: Docker Compose (Recommandé)
```bash
# Lancer API + MySQL ensemble
docker-compose up

# En background:
docker-compose up -d

# Arrêter:
docker-compose down
```

**Avantages:**
- Include automatiquement MySQL
- Configuration complète
- Idéal pour la production

#### Option B: Docker seul
```bash
# Build l'image
docker build -t riada-api .

# Lancer le container
docker run -p 5275:5275 \
  -e ConnectionStrings__DefaultConnection="..." \
  riada-api
```

---

## ✨ Choisir la Bonne Option

| Situation | Recommandé | Commande |
|-----------|-----------|----------|
| Je suis débutant, Windows | `run.bat` | Double-clic |
| Je suis dev, Windows | `run.ps1` | `.\run.ps1` |
| Je suis dev, Mac/Linux | `Makefile` | `make run` |
| Je veux déployer | `Docker Compose` | `docker-compose up` |
| Je teste rapidement | `run.ps1 --build` | `.\run.ps1 --build` |

---

## 🎯 Résultats Attendus

Après lancement, tu devrais voir:

```
✅ .NET SDK détecté
✅ Restauration réussie
✅ Build réussi (0 erreurs)
🚀 API Riada est en cours de démarrage...

Ouvre dans ton navigateur:
  🌐 Swagger:  https://localhost:5275/swagger
  📊 API:      https://localhost:5275
  🏥 Health:   https://localhost:5275/health
```

---

## 🔧 Configuration

### Variables d'Environnement (Docker)

Dans `docker-compose.yml`, tu peux modifier:

```yaml
environment:
  ConnectionStrings__DefaultConnection: "Server=..." # BD
  Jwt__SecretKey: "your-secret-key"                 # JWT
  ASPNETCORE_ENVIRONMENT: "Development"             # Env
```

### Ports

- **5275** - Port HTTPS de l'API
- **5174** - Port HTTP (fallback)
- **3306** - MySQL (Docker Compose seulement)

---

## 📊 Comparaison Rapide

| Script | Windows | Mac/Linux | Simplicité | Flexibilité |
|--------|---------|-----------|-----------|-------------|
| `run.bat` | ✅ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| `run.ps1` | ✅ | ⚠️ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| `Makefile` | ⚠️ | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| `Docker` | ✅ | ✅ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🐛 Troubleshooting

### Erreur: "dotnet not found"
```
❌ SOLUTION: Installe .NET 8.0 SDK
https://dotnet.microsoft.com/download
```

### Erreur: "Port 5275 already in use"
```bash
# Tue le processus qui utilise le port (Windows):
netstat -ano | findstr :5275
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5275
kill -9 <PID>
```

### Erreur: "Connection to MySQL failed"
```
✅ Assure-toi que MySQL est en cours d'exécution
✅ Vérifie les credentials dans appsettings.json
✅ Test avec: mysql -u root -p
```

### Permission Denied (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📈 Performance Tips

1. **Build Release pour la production:**
   ```bash
   .\run.ps1 --release
   ```

2. **Mode Watch pour le développement:**
   ```bash
   make watch              # Rechargement automatique
   ```

3. **Tests avant commit:**
   ```bash
   .\run.ps1 --test
   ```

---

## 🎉 Vous Êtes Prêt!

Choisis ta méthode et Lance! 🚀

Pour plus de détails, voir:
- `QUICK_START.md` - Démarrage en 30 secondes
- `README.md` - Documentation complète
- `ARCHITECTURE.md` - Architecture du projet

---

**Version:** 1.0  
**Dernière mise à jour:** Décembre 2024  
**Statut:** ✅ Prêt pour production
