using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace Riada.API.Security;

/// <summary>
/// Generates and validates JWT tokens with proper expiration and refresh token rotation.
/// </summary>
public interface ITokenService
{
    TokenResponse GenerateToken(string userId, string[] roles);
    RefreshTokenResponse RefreshToken(string refreshToken);
    bool ValidateRefreshToken(string refreshToken);
    void RevokeToken(string token);
    bool IsTokenRevoked(string token);
    string? GetUserId(string token);
}

public record TokenResponse(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    string TokenType = "Bearer");

public record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    string TokenType = "Bearer");

public class JwtTokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly byte[] _secretKey;
    private readonly ILogger<JwtTokenService> _logger;
    private readonly object _revocationSync = new();
    private readonly Dictionary<string, DateTimeOffset> _revokedTokenJtis = new(StringComparer.Ordinal);
    private readonly int _accessTokenExpirationMinutes;
    private readonly int _refreshTokenExpirationDays;
    private readonly string _revocationStorePath;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    public JwtTokenService(IConfiguration configuration, ILogger<JwtTokenService> logger)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _secretKey = JwtSecretProvider.GetSecretKey();

        var jwtConfig = _configuration.GetSection("Jwt");
        _accessTokenExpirationMinutes = ReadPositiveInt(jwtConfig["AccessTokenExpirationMinutes"], fallback: 60);
        _refreshTokenExpirationDays = ReadPositiveInt(jwtConfig["RefreshTokenExpirationDays"], fallback: 7);
        _revocationStorePath = ResolveRevocationStorePath(jwtConfig["RevocationStorePath"]);

        LoadRevocationsFromDisk();
    }

    public TokenResponse GenerateToken(string userId, string[] roles)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User ID cannot be empty.", nameof(userId));

        // Generate access token (short-lived)
        var accessToken = GenerateAccessToken(userId, roles, _accessTokenExpirationMinutes);
        
        // Generate refresh token (long-lived)
        var refreshToken = GenerateRefreshToken(userId, roles, _refreshTokenExpirationDays);

        _logger.LogInformation(
            "✅ Token generated for user {UserId} with roles: {Roles}",
            userId,
            string.Join(", ", roles));

        return new TokenResponse(
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            ExpiresIn: _accessTokenExpirationMinutes * 60, // in seconds
            TokenType: "Bearer");
    }

    public RefreshTokenResponse RefreshToken(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new ArgumentException("Refresh token cannot be empty.", nameof(refreshToken));

        if (!ValidateRefreshToken(refreshToken))
            throw new InvalidOperationException("Refresh token is invalid or expired.");

        // Extract user ID from refresh token
        var principal = GetPrincipalFromToken(refreshToken, validateLifetime: true, out _);
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roles = principal.Claims
            .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
            .Select(c => c.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (string.IsNullOrEmpty(userId))
            throw new InvalidOperationException("Could not extract user ID from refresh token.");

        // Revoke old refresh token
        RevokeToken(refreshToken);
        _logger.LogInformation("🔄 Refresh token rotated for user {UserId}", userId);

        // Generate new tokens
        return new RefreshTokenResponse(
            AccessToken: GenerateAccessToken(userId, roles, _accessTokenExpirationMinutes),
            RefreshToken: GenerateRefreshToken(userId, roles, _refreshTokenExpirationDays),
            ExpiresIn: _accessTokenExpirationMinutes * 60,
            TokenType: "Bearer");
    }

    public bool ValidateRefreshToken(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return false;

        try
        {
            var principal = GetPrincipalFromToken(refreshToken, validateLifetime: true, out _);
            var tokenType = principal.FindFirst("typ")?.Value;
            if (!string.Equals(tokenType, "refresh_token", StringComparison.Ordinal))
                return false;

            return !IsPrincipalRevoked(principal);
        }
        catch (SecurityTokenException)
        {
            return false;
        }
        catch (ArgumentException)
        {
            return false;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public void RevokeToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Token cannot be empty.", nameof(token));

        var principal = GetPrincipalFromToken(token, validateLifetime: false, out var validatedToken);
        var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

        if (string.IsNullOrWhiteSpace(jti))
            throw new InvalidOperationException("Token does not contain a valid JTI claim.");

        var expiresAtUtc = new DateTimeOffset(validatedToken.ValidTo);
        var now = DateTimeOffset.UtcNow;

        if (expiresAtUtc <= now)
            return;

        lock (_revocationSync)
        {
            _revokedTokenJtis[jti] = expiresAtUtc;
            CleanupExpiredRevocationsLocked(now, persistChanges: false);
            PersistRevocationsToDiskLocked();
        }
    }

    public bool IsTokenRevoked(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return false;

        try
        {
            var principal = GetPrincipalFromToken(token, validateLifetime: false, out _);
            return IsPrincipalRevoked(principal);
        }
        catch (SecurityTokenException)
        {
            return false;
        }
        catch (ArgumentException)
        {
            return false;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public string? GetUserId(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        try
        {
            var principal = GetPrincipalFromToken(token, validateLifetime: false, out _);
            return principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
        catch (SecurityTokenException)
        {
            return null;
        }
        catch (ArgumentException)
        {
            return null;
        }
        catch (FormatException)
        {
            return null;
        }
    }

    private string GenerateAccessToken(string userId, string[] roles, int expirationMinutes)
    {
        var jwtConfig = _configuration.GetSection("Jwt");
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, userId),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
            new("typ", "access_token")
        };

        // Add roles as claims
        foreach (var role in roles ?? Array.Empty<string>())
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
            claims.Add(new Claim("role", role));
        }

        var key = new SymmetricSecurityKey(_secretKey);
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtConfig["Issuer"],
            audience: jwtConfig["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken(string userId, string[] roles, int expirationDays)
    {
        var jwtConfig = _configuration.GetSection("Jwt");
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new("typ", "refresh_token"),
            new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        foreach (var role in roles ?? Array.Empty<string>())
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
            claims.Add(new Claim("role", role));
        }

        var key = new SymmetricSecurityKey(_secretKey);
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtConfig["Issuer"],
            audience: jwtConfig["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expirationDays),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal GetPrincipalFromToken(string token, bool validateLifetime, out SecurityToken validatedToken)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(_secretKey),
            ValidateIssuer = true,
            ValidIssuer = _configuration.GetSection("Jwt")["Issuer"],
            ValidateAudience = true,
            ValidAudience = _configuration.GetSection("Jwt")["Audience"],
            ValidateLifetime = validateLifetime,
            ClockSkew = TimeSpan.FromSeconds(30)
        }, out validatedToken);
    }

    private bool IsPrincipalRevoked(ClaimsPrincipal principal)
    {
        var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        if (string.IsNullOrWhiteSpace(jti))
            return true;

        var now = DateTimeOffset.UtcNow;

        lock (_revocationSync)
        {
            CleanupExpiredRevocationsLocked(now, persistChanges: true);
            return _revokedTokenJtis.TryGetValue(jti, out var expiresAtUtc) && expiresAtUtc > now;
        }
    }

    private void LoadRevocationsFromDisk()
    {
        if (!File.Exists(_revocationStorePath))
            return;

        try
        {
            var json = File.ReadAllText(_revocationStorePath);
            if (string.IsNullOrWhiteSpace(json))
                return;

            var fromDisk = JsonSerializer.Deserialize<Dictionary<string, DateTimeOffset>>(json, _jsonOptions);
            if (fromDisk is null || fromDisk.Count == 0)
                return;

            var now = DateTimeOffset.UtcNow;
            lock (_revocationSync)
            {
                foreach (var (jti, expiresAtUtc) in fromDisk)
                {
                    if (!string.IsNullOrWhiteSpace(jti) && expiresAtUtc > now)
                        _revokedTokenJtis[jti] = expiresAtUtc;
                }
            }
        }
        catch (IOException ex)
        {
            _logger.LogWarning(ex, "Unable to read token revocation store from {Path}", _revocationStorePath);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Access denied to token revocation store at {Path}", _revocationStorePath);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Token revocation store is malformed at {Path}", _revocationStorePath);
        }
    }

    private void PersistRevocationsToDiskLocked()
    {
        try
        {
            var directory = Path.GetDirectoryName(_revocationStorePath);
            if (!string.IsNullOrWhiteSpace(directory))
                Directory.CreateDirectory(directory);

            var json = JsonSerializer.Serialize(_revokedTokenJtis, _jsonOptions);
            File.WriteAllText(_revocationStorePath, json);
        }
        catch (IOException ex)
        {
            _logger.LogWarning(ex, "Unable to persist token revocation store to {Path}", _revocationStorePath);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Access denied while writing token revocation store to {Path}", _revocationStorePath);
        }
    }

    private void CleanupExpiredRevocationsLocked(DateTimeOffset now, bool persistChanges)
    {
        var expired = _revokedTokenJtis
            .Where(entry => entry.Value <= now)
            .Select(entry => entry.Key)
            .ToArray();

        if (expired.Length == 0)
            return;

        foreach (var key in expired)
            _revokedTokenJtis.Remove(key);

        if (persistChanges)
            PersistRevocationsToDiskLocked();
    }

    private static int ReadPositiveInt(string? rawValue, int fallback) =>
        int.TryParse(rawValue, out var parsed) && parsed > 0 ? parsed : fallback;

    private static string ResolveRevocationStorePath(string? configuredPath)
    {
        if (!string.IsNullOrWhiteSpace(configuredPath))
            return Path.GetFullPath(configuredPath);

        var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        if (string.IsNullOrWhiteSpace(localAppData))
            localAppData = AppContext.BaseDirectory;

        return Path.Combine(localAppData, "Riada", "security", "revoked-token-jtis.json");
    }
}
