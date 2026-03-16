# 07 — Security Division Agents v3
> Principes intégrés : Audit cryptographique inaltérable, obfuscation systématique des erreurs, Row-Level Security pour agents IA, zéro credentials hardcodés, fail-closed, Human-in-the-Loop

---

## Authentication Guardian

### Identity
Tu sécurises l'authentification JWT et l'autorisation RBAC de Riada. Principe : **fail closed** — si le contexte de sécurité est absent, l'accès est refusé par défaut.

### Mapping Rôles MySQL → Policies ASP.NET

```
MySQL role_gate_access     → portique_user  → Policy "GateAccess"      → AccessController
MySQL role_billing_ops     → billing_user   → Policy "BillingOps"      → BillingController, AnalyticsController  
MySQL role_data_protection → dpo_user       → Policy "DataProtection"  → RGPD, Freeze, Renew
```

### Audit de sécurité authentification

```bash
#!/bin/bash
set -euo pipefail

echo "═══ AUTHENTICATION AUDIT ═══"

# 1. Force de la clé JWT (minimum 32 caractères)
echo "--- JWT Secret Key ---"
key=$(grep -oP '"SecretKey":\s*"([^"]+)"' src/Riada.API/appsettings.json | grep -oP '"[^"]+"\s*$' | tr -d '"')
key_len=${#key}
echo "  Longueur: $key_len caractères"
[ "$key_len" -ge 32 ] && echo "  ✅ Longueur suffisante" || echo "  ❌ CRITIQUE: clé < 32 chars"
echo "$key" | grep -qiE "change|default|your|secret|password" && echo "  ❌ CRITIQUE: clé par défaut détectée !" || echo "  ✅ Pas de clé par défaut"

# 2. Tous les controllers ont [Authorize]
echo ""
echo "--- Endpoints sans [Authorize] ---"
for ctrl in src/Riada.API/Controllers/*.cs; do
    name=$(basename "$ctrl" .cs)
    # Vérifier [Authorize] au niveau classe OU au niveau de chaque méthode
    class_auth=$(grep -c "\[Authorize\]" "$ctrl" 2>/dev/null)
    methods=$(grep -c "\[Http" "$ctrl" 2>/dev/null)
    if [ "$class_auth" -eq 0 ]; then
        echo "  ❌ $name : PAS de [Authorize] au niveau classe ($methods endpoints exposés)"
    else
        echo "  ✅ $name : protégé ($methods endpoints)"
    fi
done

# 3. DevBypass — contournement d'auth en dev
echo ""
echo "--- DevBypass (dangereux si atteint la prod) ---"
if grep -qn "DevBypass\|ClaimTypes.Role.*admin.*billing.*portique.*dpo" src/Riada.API/Program.cs 2>/dev/null; then
    # Vérifier qu'il est dans un bloc IsDevelopment
    in_dev_block=$(grep -B5 "DevBypass\|identity.AddClaim" src/Riada.API/Program.cs | grep -c "IsDevelopment")
    if [ "$in_dev_block" -gt 0 ]; then
        echo "  ⚠️  DevBypass présent mais protégé par IsDevelopment() → OK en dev"
    else
        echo "  ❌ CRITIQUE: DevBypass HORS du bloc IsDevelopment → accessible en prod !"
    fi
else
    echo "  ✅ Pas de DevBypass"
fi

# 4. Token lifetime
echo ""
echo "--- Token expiration ---"
grep -n "ExpirationMinutes\|ValidateLifetime" src/Riada.API/Program.cs src/Riada.API/appsettings*.json 2>/dev/null
```

---

## API Security Guardian

### Identity
Tu protèges les endpoints contre les abus : injection SQL, XSS, CORS permissif, rate limiting absent.

### Principe : Obfuscation systématique des erreurs

D'après le texte : *"Ne jamais divulguer la trace de la pile. Les erreurs backend doivent être obfusquées et renvoyées sous forme de codes HTTP standardisés accompagnés de messages génériques."*

```bash
echo "═══ API SECURITY AUDIT ═══"

# 1. GlobalExceptionHandler ne leak pas les stack traces
echo "--- Error obfuscation ---"
grep -n "ex.Message\|ex.StackTrace\|ex.InnerException" src/Riada.API/Middleware/GlobalExceptionHandler.cs 2>/dev/null | grep -v "LogError\|LogWarning\|// " | while read line; do
    echo "  ❌ FUITE POTENTIELLE: $line"
done
# Le catch-all doit retourner "An unexpected error occurred" (pas ex.Message)
grep -q "An unexpected error occurred\|INTERNAL_ERROR" src/Riada.API/Middleware/GlobalExceptionHandler.cs && echo "  ✅ Message générique pour 500" || echo "  ❌ Pas de message obfusqué pour les erreurs internes"

# 2. SQL injection — interpolation de chaîne dans les requêtes
echo ""
echo "--- SQL injection risk ---"
grep -rn '\$".*SELECT\|\$".*INSERT\|\$".*UPDATE\|\$".*DELETE\|\$".*FROM' src/Riada.Infrastructure/ --include="*.cs" 2>/dev/null | grep -v "@\|DynamicParameters\|// " | while read line; do
    echo "  ❌ Interpolation SQL non paramétrée: $line"
done
echo "  (Toutes les requêtes doivent utiliser @paramètres ou DynamicParameters)"

# 3. CORS policy
echo ""
echo "--- CORS ---"
grep -A10 "AddCors\|SetIsOriginAllowed" src/Riada.API/Program.cs 2>/dev/null
echo "  ⚠️  Vérifier que SetIsOriginAllowed n'autorise pas '*' en production"

# 4. Rate limiting
echo ""
echo "--- Rate Limiting ---"
grep -rn "AddRateLimiter\|EnableRateLimiting\|UseRateLimiter" src/Riada.API/ --include="*.cs" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "  ⚠️  Pas de rate limiting configuré (recommandé: ASP.NET Core 8 natif)"
fi

# 5. HTTPS enforcement
echo ""
echo "--- HTTPS ---"
grep -n "UseHttpsRedirection" src/Riada.API/Program.cs && echo "  ✅ HTTPS redirection activée" || echo "  ❌ HTTPS non forcé"

# 6. Security headers
echo ""
echo "--- Security Headers Middleware ---"
for header in "X-Content-Type-Options" "X-Frame-Options" "Strict-Transport-Security" "Referrer-Policy"; do
    grep -q "$header" src/Riada.API/Middleware/SecurityHeadersMiddleware.cs 2>/dev/null && echo "  ✅ $header" || echo "  ❌ $header manquant"
done
```

---

## Vulnerability Scanner

### Identity
Tu scannes le code pour les failles connues : secrets hardcodés, packages vulnérables, dead code dangereux.

### Scan complet

```bash
#!/bin/bash
set -euo pipefail

echo "═══ VULNERABILITY SCAN ═══"

# 1. Secrets hardcodés (filtrer les commentaires et les noms de variables)
echo "--- 1. Secrets en dur ---"
grep -rn "password\|secret\|apikey\|connectionstring" src/ --include="*.cs" --include="*.json" -i 2>/dev/null \
    | grep -v "appsettings\|launchSettings\|// \|///\|summary\|<param\|nameof\|\"Jwt\"\|Configuration\[" \
    | grep -vi "parameter\|property\|interface\|class " \
    | head -10
echo "  (Chaque résultat ci-dessus doit être vérifié manuellement)"

# 2. NuGet vulnérables
echo ""
echo "--- 2. Packages vulnérables ---"
dotnet list package --vulnerable 2>/dev/null | grep -E ">" || echo "  ✅ Aucun package vulnérable"

# 3. Packages obsolètes
echo ""
echo "--- 3. Packages obsolètes ---"
dotnet list package --outdated 2>/dev/null | grep -E ">" | head -10

# 4. Dead code dangereux (classes jamais utilisées)
echo ""
echo "--- 4. Dead code potentiel ---"
for file in src/Riada.API/Security/*.cs; do
    [ -f "$file" ] || continue
    classname=$(grep "public.*class " "$file" 2>/dev/null | head -1 | awk '{print $3}')
    [ -z "$classname" ] && continue
    refs=$(grep -rn "$classname" src/ --include="*.cs" 2>/dev/null | grep -v "$(basename $file)" | wc -l)
    [ "$refs" -eq 0 ] && echo "  ⚠️  $classname ($file) → 0 références (dead code ?)"
done

# 5. InputSanitizer utilisé ou dead code ?
echo ""
echo "--- 5. InputSanitizer status ---"
refs=$(grep -rn "InputSanitizer" src/ --include="*.cs" 2>/dev/null | grep -v "InputSanitizer.cs\|// " | wc -l)
echo "  InputSanitizer référencé $refs fois hors de sa propre définition"
[ "$refs" -eq 0 ] && echo "  ⚠️  Dead code → supprimer ou intégrer dans le pipeline"

# 6. eval/exec dangereux dans les scripts
echo ""
echo "--- 6. Commandes dangereuses dans les scripts ---"
find . -name "*.sh" -o -name "*.ps1" | xargs grep -n "eval\|Invoke-Expression" 2>/dev/null | head -5
```

### Audit trail structuré — Ce que le journal RGPD doit contenir

D'après le texte : *"Un registre inaltérable documentant l'ensemble du cycle de vie des décisions."*

La table `audit_gdpr` de Riada contient déjà :
```sql
audit_gdpr (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    member_id INT UNSIGNED,
    anonymized_at DATETIME(3),
    requested_by VARCHAR(100)   -- QUI a demandé l'anonymisation
)
```

**Extension recommandée pour un audit complet :**
```sql
-- Champs supplémentaires recommandés (si évolution du schéma autorisée)
-- ip_address VARCHAR(45)           → traçabilité réseau
-- user_agent VARCHAR(255)          → contexte de la requête
-- action_hash CHAR(64)             → SHA-256 de l'action pour intégrité cryptographique
-- previous_state JSON              → état avant modification (pour rollback)
```
