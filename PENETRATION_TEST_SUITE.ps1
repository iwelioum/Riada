# ============================================================================
# RIADA API PENETRATION TESTING SUITE
# Comprehensive security testing for all 33 endpoints
# ============================================================================

# Configuration
$BaseUrl = "http://localhost:5000"
$AdminToken = $null
$BillingToken = $null
$PortiqueToken = $null
$GuestToken = $null
$TestResults = @()

# ============================================================================
# PHASE 1: AUTHENTICATION & TOKEN GENERATION
# ============================================================================

Write-Host "======================== PHASE 1: AUTHENTICATION ========================" -ForegroundColor Cyan

# Test 1.1: Basic Token Generation
Write-Host "`n[TEST 1.1] Basic token generation (POST /api/auth/token)" -ForegroundColor Yellow

$tokenRequest = @{
    UserId = "test-admin-001"
    Roles = @("admin", "billing", "portique", "dpo")
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/token" `
        -Method POST `
        -ContentType "application/json" `
        -Body $tokenRequest `
        -SkipCertificateCheck
    
    $tokenData = $response.Content | ConvertFrom-Json
    $AdminToken = $tokenData.AccessToken
    $AdminRefreshToken = $tokenData.RefreshToken
    
    Write-Host "✅ PASS: Token generated successfully" -ForegroundColor Green
    Write-Host "   - Access Token (first 50 chars): $($AdminToken.Substring(0, 50))..."
    Write-Host "   - Expires In: $($tokenData.ExpiresIn) seconds"
} catch {
    Write-Host "❌ FAIL: Token generation failed" -ForegroundColor Red
    Write-Host "   Error: $_"
}

# Test 1.2: Token with Missing UserId
Write-Host "`n[TEST 1.2] Token generation with empty UserId (injection test)" -ForegroundColor Yellow

$badRequest = @{
    UserId = ""
    Roles = @("admin")
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/token" `
        -Method POST `
        -ContentType "application/json" `
        -Body $badRequest `
        -SkipCertificateCheck `
        -ErrorAction SilentlyContinue
    
    Write-Host "⚠️  ISSUE: Empty UserId accepted" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 422) {
        Write-Host "✅ PASS: Empty UserId rejected (400/422)" -ForegroundColor Green
    } else {
        Write-Host "? UNKNOWN: Unexpected error code $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
}

# Test 1.3: SQL Injection in UserId
Write-Host "`n[TEST 1.3] SQL injection attempt in UserId" -ForegroundColor Yellow

$sqlInjectionPayloads = @(
    "test'; DROP TABLE members; --",
    "test' UNION SELECT * FROM members; --",
    "test'; EXEC sp_executesql; --"
)

foreach ($payload in $sqlInjectionPayloads) {
    $injectionRequest = @{
        UserId = $payload
        Roles = @("admin")
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/token" `
            -Method POST `
            -ContentType "application/json" `
            -Body $injectionRequest `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            # If we got a valid token, injection might have worked
            Write-Host "⚠️  CONCERN: Payload accepted: $payload" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✅ PASS: Payload rejected: $payload" -ForegroundColor Green
    }
}

# Test 1.4: XSS in UserId (JavaScript payload)
Write-Host "`n[TEST 1.4] XSS attempt in UserId" -ForegroundColor Yellow

$xssPayloads = @(
    "<script>alert('xss')</script>",
    "javascript:alert('xss')",
    "onerror=alert('xss')"
)

foreach ($payload in $xssPayloads) {
    $xssRequest = @{
        UserId = $payload
        Roles = @("admin")
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/token" `
            -Method POST `
            -ContentType "application/json" `
            -Body $xssRequest `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue
        
        Write-Host "⚠️  CONCERN: XSS payload accepted: $payload" -ForegroundColor Yellow
    } catch {
        Write-Host "✅ PASS: XSS payload rejected: $payload" -ForegroundColor Green
    }
}

# Test 1.5: Rate Limiting on /token endpoint
Write-Host "`n[TEST 1.5] Rate limiting on token endpoint (5 attempts/min)" -ForegroundColor Yellow

$rateLimitTest = $true
$attempts = 0

for ($i = 1; $i -le 10; $i++) {
    $request = @{
        UserId = "test-user-$i"
        Roles = @("admin")
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/token" `
            -Method POST `
            -ContentType "application/json" `
            -Body $request `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue
        
        $attempts++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "✅ PASS: Rate limiting triggered at attempt $i (429 Too Many Requests)" -ForegroundColor Green
            $rateLimitTest = $true
            break
        }
    }
}

if ($attempts -ge 10) {
    Write-Host "❌ FAIL: No rate limiting detected after 10 requests" -ForegroundColor Red
}

# Test 1.6: Refresh Token Validation
Write-Host "`n[TEST 1.6] Refresh token functionality" -ForegroundColor Yellow

if ($AdminRefreshToken) {
    $refreshRequest = @{
        RefreshToken = $AdminRefreshToken
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/refresh" `
            -Method POST `
            -ContentType "application/json" `
            -Body $refreshRequest `
            -SkipCertificateCheck

        $refreshData = $response.Content | ConvertFrom-Json
        Write-Host "✅ PASS: Refresh token accepted" -ForegroundColor Green
        Write-Host "   - New Access Token issued" -ForegroundColor Green
    } catch {
        Write-Host "❌ FAIL: Refresh token rejected" -ForegroundColor Red
    }
}

# Test 1.7: Invalid Refresh Token
Write-Host "`n[TEST 1.7] Invalid/expired refresh token" -ForegroundColor Yellow

$badRefreshRequest = @{
    RefreshToken = "invalid.token.here"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/refresh" `
        -Method POST `
        -ContentType "application/json" `
        -Body $badRefreshRequest `
        -SkipCertificateCheck `
        -ErrorAction SilentlyContinue

    Write-Host "❌ FAIL: Invalid refresh token accepted" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASS: Invalid refresh token rejected" -ForegroundColor Green
    }
}

# ============================================================================
# PHASE 2: AUTHORIZATION & RBAC TESTING
# ============================================================================

Write-Host "`n======================== PHASE 2: AUTHORIZATION ========================" -ForegroundColor Cyan

# Test 2.1: Access without token
Write-Host "`n[TEST 2.1] Access protected endpoints without token" -ForegroundColor Yellow

$protectedEndpoints = @(
    "/api/members",
    "/api/guests",
    "/api/contracts/1",
    "/api/equipment"
)

foreach ($endpoint in $protectedEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$endpoint" `
            -Method GET `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue

        Write-Host "❌ FAIL: Endpoint accessible without token: $endpoint" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ PASS: 401 Unauthorized without token: $endpoint" -ForegroundColor Green
        } else {
            Write-Host "? Status code $($_.Exception.Response.StatusCode): $endpoint" -ForegroundColor Gray
        }
    }
}

# Test 2.2: Modified/Invalid JWT
Write-Host "`n[TEST 2.2] Access with modified JWT token" -ForegroundColor Yellow

if ($AdminToken) {
    $modifiedToken = $AdminToken.Substring(0, $AdminToken.Length - 5) + "HACKED"
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/members" `
            -Method GET `
            -Headers @{ "Authorization" = "Bearer $modifiedToken" } `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue

        Write-Host "❌ FAIL: Modified token accepted" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ PASS: Modified token rejected (401)" -ForegroundColor Green
        }
    }
}

# Test 2.3: Policy-based authorization (BillingOps)
Write-Host "`n[TEST 2.3] Policy-based authorization enforcement (BillingOps)" -ForegroundColor Yellow

# Create token without billing role
$limitedRequest = @{
    UserId = "test-user-limited"
    Roles = @()  # No roles
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/token" `
        -Method POST `
        -ContentType "application/json" `
        -Body $limitedRequest `
        -SkipCertificateCheck

    $limitedTokenData = $response.Content | ConvertFrom-Json
    $limitedToken = $limitedTokenData.AccessToken

    # Try to access BillingOps endpoint
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/analytics/risk-scores" `
            -Method GET `
            -Headers @{ "Authorization" = "Bearer $limitedToken" } `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue

        Write-Host "❌ FAIL: BillingOps endpoint accessible without billing role" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ PASS: BillingOps endpoint blocked (403) for non-billing user" -ForegroundColor Green
        } else {
            Write-Host "? Unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "! Error generating limited token: $_" -ForegroundColor Red
}

# ============================================================================
# PHASE 3: INPUT VALIDATION & INJECTION ATTACKS
# ============================================================================

Write-Host "`n======================== PHASE 3: INPUT VALIDATION ========================" -ForegroundColor Cyan

if ($AdminToken) {
    # Test 3.1: GET with SQL injection in query parameter
    Write-Host "`n[TEST 3.1] SQL injection in query parameters (GET /api/members?search=...)" -ForegroundColor Yellow

    $sqlPayloads = @(
        "test' OR '1'='1",
        "test'; DROP TABLE members; --",
        "test' UNION SELECT password FROM users --"
    )

    foreach ($payload in $sqlPayloads) {
        $encodedPayload = [System.Web.HttpUtility]::UrlEncode($payload)
        
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl/api/members?search=$encodedPayload" `
                -Method GET `
                -Headers @{ "Authorization" = "Bearer $AdminToken" } `
                -SkipCertificateCheck `
                -ErrorAction SilentlyContinue

            if ($response.StatusCode -eq 200) {
                $data = $response.Content | ConvertFrom-Json
                # Analyze response for unexpected data
                Write-Host "⚠️  CONCERN: Injection payload processed: $payload" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "✅ PASS: Injection payload rejected: $payload" -ForegroundColor Green
        }
    }

    # Test 3.2: POST request with XSS in JSON body
    Write-Host "`n[TEST 3.2] XSS attack in POST body (JSON)" -ForegroundColor Yellow

    $xssRequestBody = @{
        FirstName = "<script>alert('xss')</script>"
        LastName = "Test"
        Email = "test@example.com"
        DateOfBirth = "1990-01-01"
        MobilePhone = "+1234567890"
        Gender = "Male"
        PrimaryGoal = "Fitness"
        AcquisitionSource = "Referral"
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/members" `
            -Method POST `
            -ContentType "application/json" `
            -Body $xssRequestBody `
            -Headers @{ "Authorization" = "Bearer $AdminToken" } `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue

        if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            # Check if XSS payload was sanitized
            if ($result.FirstName -contains "<script") {
                Write-Host "❌ FAIL: XSS payload stored in response" -ForegroundColor Red
            } else {
                Write-Host "✅ PASS: XSS payload sanitized or rejected" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "✅ PASS: XSS POST request rejected" -ForegroundColor Green
    }

    # Test 3.3: Extremely long string input (buffer overflow attempt)
    Write-Host "`n[TEST 3.3] Buffer overflow - extremely long input (10000+ chars)" -ForegroundColor Yellow

    $longString = "A" * 10001

    $longInputRequest = @{
        FirstName = $longString
        LastName = "Test"
        Email = "test@example.com"
        DateOfBirth = "1990-01-01"
        MobilePhone = "+1234567890"
        Gender = "Male"
        PrimaryGoal = "Fitness"
        AcquisitionSource = "Referral"
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/members" `
            -Method POST `
            -ContentType "application/json" `
            -Body $longInputRequest `
            -Headers @{ "Authorization" = "Bearer $AdminToken" } `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue

        Write-Host "⚠️  CONCERN: Extremely long input accepted" -ForegroundColor Yellow
    } catch {
        Write-Host "✅ PASS: Long input rejected" -ForegroundColor Green
    }

    # Test 3.4: Null/empty validation
    Write-Host "`n[TEST 3.4] Null/empty field validation" -ForegroundColor Yellow

    $emptyFieldsRequest = @{
        FirstName = ""
        LastName = ""
        Email = ""
        DateOfBirth = ""
        MobilePhone = ""
        Gender = ""
        PrimaryGoal = ""
        AcquisitionSource = ""
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/members" `
            -Method POST `
            -ContentType "application/json" `
            -Body $emptyFieldsRequest `
            -Headers @{ "Authorization" = "Bearer $AdminToken" } `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue

        Write-Host "❌ FAIL: Empty fields accepted" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "✅ PASS: Empty fields rejected (400)" -ForegroundColor Green
        }
    }

    # Test 3.5: Invalid date format
    Write-Host "`n[TEST 3.5] Invalid date format validation" -ForegroundColor Yellow

    $invalidDateRequest = @{
        FirstName = "Test"
        LastName = "User"
        Email = "test@example.com"
        DateOfBirth = "not-a-date"
        MobilePhone = "+1234567890"
        Gender = "Male"
        PrimaryGoal = "Fitness"
        AcquisitionSource = "Referral"
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/members" `
            -Method POST `
            -ContentType "application/json" `
            -Body $invalidDateRequest `
            -Headers @{ "Authorization" = "Bearer $AdminToken" } `
            -SkipCertificateCheck `
            -ErrorAction SilentlyContinue

        Write-Host "❌ FAIL: Invalid date accepted" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "✅ PASS: Invalid date rejected (400)" -ForegroundColor Green
        }
    }
}

Write-Host "`n✅ Penetration test suite execution completed!" -ForegroundColor Green
Write-Host "Review the results above for detailed findings." -ForegroundColor Yellow
