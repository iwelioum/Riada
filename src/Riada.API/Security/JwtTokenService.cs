using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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
    private readonly HashSet<string> _revokedTokens = new();

    public JwtTokenService(IConfiguration configuration, ILogger<JwtTokenService> logger)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _secretKey = JwtSecretProvider.GetSecretKey();
    }

    public TokenResponse GenerateToken(string userId, string[] roles)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User ID cannot be empty.", nameof(userId));

        var jwtConfig = _configuration.GetSection("Jwt");
        var accessTokenExpirationMinutes = 
            int.Parse(jwtConfig["AccessTokenExpirationMinutes"] ?? "60");
        var refreshTokenExpirationDays = 
            int.Parse(jwtConfig["RefreshTokenExpirationDays"] ?? "7");

        // Generate access token (short-lived)
        var accessToken = GenerateAccessToken(userId, roles, accessTokenExpirationMinutes);
        
        // Generate refresh token (long-lived)
        var refreshToken = GenerateRefreshToken(userId, refreshTokenExpirationDays);

        _logger.LogInformation(
            "✅ Token generated for user {UserId} with roles: {Roles}",
            userId,
            string.Join(", ", roles));

        return new TokenResponse(
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            ExpiresIn: accessTokenExpirationMinutes * 60, // in seconds
            TokenType: "Bearer");
    }

    public RefreshTokenResponse RefreshToken(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new ArgumentException("Refresh token cannot be empty.", nameof(refreshToken));

        if (!ValidateRefreshToken(refreshToken))
            throw new InvalidOperationException("Refresh token is invalid or expired.");

        // Extract user ID from refresh token
        var principal = GetPrincipalFromToken(refreshToken);
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roles = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray();

        if (string.IsNullOrEmpty(userId))
            throw new InvalidOperationException("Could not extract user ID from refresh token.");

        // Revoke old refresh token
        _revokedTokens.Add(refreshToken);
        _logger.LogInformation("🔄 Refresh token rotated for user {UserId}", userId);

        // Generate new tokens
        return new RefreshTokenResponse(
            AccessToken: GenerateAccessToken(userId, roles, 60),
            RefreshToken: GenerateRefreshToken(userId, 7),
            ExpiresIn: 3600, // 1 hour in seconds
            TokenType: "Bearer");
    }

    public bool ValidateRefreshToken(string refreshToken)
    {
        // Check if token is revoked
        if (_revokedTokens.Contains(refreshToken))
            return false;

        try
        {
            var principal = GetPrincipalFromToken(refreshToken);
            return principal != null;
        }
        catch
        {
            return false;
        }
    }

    private string GenerateAccessToken(string userId, string[] roles, int expirationMinutes)
    {
        var jwtConfig = _configuration.GetSection("Jwt");
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, userId),
            new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
            new("typ", "access_token")
        };

        // Add roles as claims
        foreach (var role in roles ?? Array.Empty<string>())
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
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

    private string GenerateRefreshToken(string userId, int expirationDays)
    {
        var jwtConfig = _configuration.GetSection("Jwt");
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new("typ", "refresh_token"),
            new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

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

    private ClaimsPrincipal GetPrincipalFromToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = _secretKey;

        var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = _configuration.GetSection("Jwt")["Issuer"],
            ValidateAudience = true,
            ValidAudience = _configuration.GetSection("Jwt")["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        }, out SecurityToken validatedToken);

        return principal;
    }
}
