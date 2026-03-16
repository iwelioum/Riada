# 08 — DevOps Infrastructure Agents v3
> Principes intégrés : `set -euo pipefail` obligatoire (Unofficial Bash Strict Mode), isolation d'état via mktemp, observabilité structurée (Serilog), health checks enrichis, CI/CD avec gate de qualité, rollback documenté

---

## Deployment Commander

### Identity
Tu garantis des déploiements fiables. **Chaque script shell commence par `set -euo pipefail`** — c'est la norme de référence absolue de l'industrie.

### Règle non-négociable : Bash Strict Mode

D'après le texte de référence :
- **`-e` (errexit)** : Le script s'arrête si une commande échoue → empêche l'exécution dans un état instable
- **`-u` (nounset)** : Variable non définie = erreur fatale → empêche `rm -rf /$UNDEFINED_VAR/`
- **`-o pipefail`** : Si une commande du pipeline échoue, tout le pipeline échoue → empêche les faux positifs

```bash
#!/bin/bash
# ══ CHAQUE SCRIPT RIADA COMMENCE PAR CETTE LIGNE ══
set -euo pipefail

# ══ Isolation d'état via répertoire temporaire unique ══
WORK_DIR=$(mktemp -d)
trap "rm -rf $WORK_DIR" EXIT  # Nettoyage automatique même en cas d'erreur

# ══ Pas de secrets hardcodés — injection via variables d'environnement ══
DB_PASSWORD="${RIADA_DB_PASSWORD:?Variable RIADA_DB_PASSWORD non définie}"
# Le :? fait échouer le script si la variable est vide (grâce à -u)
```

### Pipeline CI/CD complet

```bash
#!/bin/bash
set -euo pipefail

echo "╔═══════════════════════════════════════╗"
echo "║    RIADA CI/CD PIPELINE               ║"
echo "╚═══════════════════════════════════════╝"

# ── ÉTAPE 1: Restore ──
echo "▸ [1/6] Restore..."
dotnet restore --verbosity quiet

# ── ÉTAPE 2: Build ──
echo "▸ [2/6] Build (Release)..."
dotnet build --configuration Release --no-restore -v q 2>&1 | tail -3
# Si -e est actif, le script s'arrête ici si le build échoue

# ── ÉTAPE 3: Tests ──
echo "▸ [3/6] Tests..."
dotnet test --no-build --configuration Release -v q 2>&1 | tail -5
# Si un test échoue, le script s'arrête (errexit)

# ── ÉTAPE 4: Architecture audit ──
echo "▸ [4/6] Architecture audit..."
# Domain ne dépend de rien
violations=$(grep -rn "Riada.Infrastructure\|Riada.Application" src/Riada.Domain/ --include="*.cs" 2>/dev/null | grep -v "// " | wc -l)
if [ "$violations" -gt 0 ]; then
    echo "  ❌ Architecture violation: Domain has $violations illegal dependencies"
    exit 1
fi
echo "  ✅ Architecture clean"

# ── ÉTAPE 5: Security scan ──
echo "▸ [5/6] Security scan..."
secrets=$(grep -rn "CHANGE_THIS\|YOUR_PASSWORD" src/Riada.API/appsettings*.json 2>/dev/null | wc -l)
if [ "$secrets" -gt 0 ]; then
    echo "  ❌ Default secrets detected — DO NOT DEPLOY"
    exit 1
fi
echo "  ✅ No default secrets"

# ── ÉTAPE 6: Publish ──
echo "▸ [6/6] Publish..."
dotnet publish src/Riada.API -c Release -o ./publish --no-build -v q
echo "  ✅ Published to ./publish/"

echo ""
echo "═══ PIPELINE COMPLETE ═══"
echo "Prêt pour déploiement."
```

### Docker avec Bash Strict Mode

```dockerfile
# Dockerfile — Multi-stage build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
# Le ENTRYPOINT de build utilise les commandes dotnet (pas de bash)
RUN dotnet restore && dotnet publish src/Riada.API -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# ══ Si un script bash est utilisé comme entrypoint ══
# ENTRYPOINT ["bash", "-c", "set -euo pipefail && dotnet Riada.API.dll"]
ENTRYPOINT ["dotnet", "Riada.API.dll"]

EXPOSE 7001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -sf http://localhost:7001/health || exit 1
```

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: "${RIADA_DB_PASSWORD:?Must set RIADA_DB_PASSWORD}"
      MYSQL_DATABASE: riada_db
    ports: ["3306:3306"]
    volumes:
      - ./sql:/docker-entrypoint-initdb.d  # Idempotent: IF NOT EXISTS dans les scripts
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5

  api:
    build: .
    ports: ["7001:7001"]
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      ConnectionStrings__RiadaDb: "Server=mysql;Port=3306;Database=riada_db;User=root;Password=${RIADA_DB_PASSWORD};SslMode=Preferred;AllowPublicKeyRetrieval=True"
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: "http://+:7001"

volumes:
  mysql_data:
```

### Rollback documenté

```bash
# En cas de déploiement échoué :
# 1. Arrêter le service
# 2. Restaurer le binaire précédent :
#    cp -r ./publish-backup/* ./publish/
# 3. Redémarrer
# 4. Vérifier : curl -sf http://localhost:7001/health && echo "OK"

# Pour Docker :
# docker-compose down
# docker-compose up -d --force-recreate
```

---

## Monitoring Agent

### Identity
Tu fournis l'observabilité runtime. D'après le texte : *"Les métriques traditionnelles (latence serveur, volume de tokens) sont insuffisantes pour débugger une prise de décision aberrante."*

### Observabilité structurée (Serilog)

```csharp
// Pattern de logging structuré dans les UseCases
// ══ CHAQUE LOG DOIT CONTENIR : timestamp + level + message + contexte structuré ══

// ✅ BON — Structuré, searchable, non-leaky
_logger.LogInformation("Access {Decision} for member {MemberId} at club {ClubId}",
    "granted", 42, 1);
// → [2026-03-16 14:32:01 INF] Access granted for member 42 at club 1

// ✅ BON — Actions RGPD avec contexte d'audit
_logger.LogWarning("GDPR anonymization executed for member {MemberId} by {RequestedBy}",
    15, "dpo_user");

// ❌ MAUVAIS — Log qui leak des données sensibles
_logger.LogInformation("Member created: {Email}, phone: {Phone}", email, phone);
// → JAMAIS logger des PII en clair (email, téléphone, adresse)
```

### Health Check enrichi

```csharp
// Program.cs — Health check avec vérification d'intégrité DB
builder.Services.AddHealthChecks()
    .AddMySql(connectionString, name: "MySQL-Connection")
    .AddAsyncCheck("MySQL-Schema", async ct =>
    {
        await using var conn = new MySqlConnection(connectionString);
        await conn.OpenAsync(ct);
        var tableCount = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='riada_db' AND table_type='BASE TABLE'", ct);
        var spCount = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema='riada_db' AND routine_type='PROCEDURE'", ct);
        
        return tableCount == 21 && spCount == 8
            ? HealthCheckResult.Healthy($"Schema OK: {tableCount} tables, {spCount} SPs")
            : HealthCheckResult.Unhealthy($"Schema drift: {tableCount} tables (exp 21), {spCount} SPs (exp 8)");
    });
```

### Checklist post-déploiement

```bash
#!/bin/bash
set -euo pipefail

echo "═══ POST-DEPLOY VERIFICATION ═══"

API_URL="${API_URL:-http://localhost:7001}"

echo "--- Health check ---"
health=$(curl -sf "$API_URL/health" 2>/dev/null)
echo "$health" | grep -q "Healthy" && echo "✅ Health: OK" || echo "❌ Health: FAIL"

echo ""
echo "--- Swagger accessible ---"
swagger_status=$(curl -sf -o /dev/null -w "%{http_code}" "$API_URL/swagger/index.html" 2>/dev/null)
[ "$swagger_status" = "200" ] && echo "✅ Swagger: OK" || echo "❌ Swagger: HTTP $swagger_status"

echo ""
echo "--- Sample endpoint ---"
members_status=$(curl -sf -o /dev/null -w "%{http_code}" "$API_URL/api/clubs" 2>/dev/null)
[ "$members_status" = "200" ] && echo "✅ GET /api/clubs: OK" || echo "❌ GET /api/clubs: HTTP $members_status"
```
