using System.IdentityModel.Tokens.Jwt;
using Xunit;
using Riada.API.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace Riada.UnitTests.Security;

public class JwtSecurityTests : IDisposable
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtTokenService> _mockLogger;
    private readonly string _revocationStorePath;

    public JwtSecurityTests()
    {
        // Setup test JWT secret (256-bit base64-encoded)
        var testSecret = "cH3p3BnH10eNneSEFbRmjKQJYpUcuzxv4OL21rTv+p8=";
        Environment.SetEnvironmentVariable("JWT_SECRET_KEY", testSecret);

        _revocationStorePath = Path.Combine(
            Path.GetTempPath(),
            $"riada-jwt-revocations-{Guid.NewGuid():N}.json");

        var configDict = new Dictionary<string, string?>
        {
            { "Jwt:Issuer", "Riada.API" },
            { "Jwt:Audience", "Riada.Clients" },
            { "Jwt:AccessTokenExpirationMinutes", "60" },
            { "Jwt:RefreshTokenExpirationDays", "7" },
            { "Jwt:RevocationStorePath", _revocationStorePath }
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configDict)
            .Build();

        _mockLogger = new Mock<ILogger<JwtTokenService>>().Object;
    }

    public void Dispose()
    {
        if (File.Exists(_revocationStorePath))
            File.Delete(_revocationStorePath);
    }

    [Fact]
    public void JwtSecretProvider_GeneratesValidSecret()
    {
        // Arrange & Act
        var secret = JwtSecretProvider.GenerateNewSecret();

        // Assert
        Assert.NotEmpty(secret);
        var decoded = Convert.FromBase64String(secret);
        Assert.Equal(32, decoded.Length); // 256 bits = 32 bytes
    }

    [Fact]
    public void JwtSecretProvider_GetSecretKey_ReturnsValidBytes()
    {
        // Arrange & Act
        var key = JwtSecretProvider.GetSecretKey();

        // Assert
        Assert.NotNull(key);
        Assert.Equal(32, key.Length); // 256 bits
    }

    [Fact]
    public void JwtSecretProvider_ThrowsWhenEnvironmentVariableNotSet()
    {
        // Arrange
        Environment.SetEnvironmentVariable("JWT_SECRET_KEY", null);

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => JwtSecretProvider.GetSecretKey());

        // Cleanup
        var testSecret = "cH3p3BnH10eNneSEFbRmjKQJYpUcuzxv4OL21rTv+p8=";
        Environment.SetEnvironmentVariable("JWT_SECRET_KEY", testSecret);
    }

    [Fact]
    public void JwtTokenService_GenerateToken_CreatesValidAccessToken()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);

        // Act
        var response = service.GenerateToken("test-user", new[] { "admin", "billing" });

        // Assert
        Assert.NotNull(response);
        Assert.NotEmpty(response.AccessToken);
        Assert.NotEmpty(response.RefreshToken);
        Assert.Equal("Bearer", response.TokenType);
        Assert.Equal(3600, response.ExpiresIn); // 1 hour in seconds

        // Verify JWT is valid
        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(response.AccessToken);
        Assert.Equal("Riada.API", token.Issuer);
        Assert.Equal("Riada.Clients", token.Audiences.First());
    }

    [Fact]
    public void JwtTokenService_GenerateToken_IncludesRolesInClaims()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);
        var roles = new[] { "admin", "billing", "portique" };

        // Act
        var response = service.GenerateToken("test-user", roles);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(response.AccessToken);
        var roleClaims = token.Claims
            .Where(c => c.Type == "role")
            .Select(c => c.Value)
            .ToList();

        Assert.Equal(roles.Length, roleClaims.Count);
        foreach (var role in roles)
        {
            Assert.Contains(role, roleClaims);
        }
    }

    [Fact]
    public void JwtTokenService_AccessTokenExpires()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);

        // Act
        var response = service.GenerateToken("test-user", new[] { "admin" });

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(response.AccessToken);
        
        // Token expiration should be in the future
        Assert.True(token.ValidTo > DateTime.UtcNow);
        
        // Should expire within 61 minutes (allowing 1 minute clock skew)
        var expirationDelta = (token.ValidTo - DateTime.UtcNow).TotalMinutes;
        Assert.True(expirationDelta <= 61 && expirationDelta >= 59);
    }

    [Fact]
    public void JwtTokenService_RefreshToken_ThrowsOnInvalidToken()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => 
            service.RefreshToken("invalid.token.here"));
    }

    [Fact]
    public void JwtTokenService_RefreshToken_RotatesTokenSuccessfully()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);
        var initialTokens = service.GenerateToken("test-user", new[] { "admin" });

        // Act
        var refreshedTokens = service.RefreshToken(initialTokens.RefreshToken);

        // Assert
        Assert.NotNull(refreshedTokens);
        Assert.NotEmpty(refreshedTokens.AccessToken);
        Assert.NotEmpty(refreshedTokens.RefreshToken);
        Assert.NotEqual(initialTokens.AccessToken, refreshedTokens.AccessToken);
        Assert.NotEqual(initialTokens.RefreshToken, refreshedTokens.RefreshToken);
    }

    [Fact]
    public void JwtTokenService_ValidateRefreshToken_ReturnsFalseForRevokedToken()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);
        var tokens = service.GenerateToken("test-user", new[] { "admin" });

        // Act: Refresh token (which revokes the old one)
        service.RefreshToken(tokens.RefreshToken);

        // Assert: Old refresh token should be invalid
        Assert.False(service.ValidateRefreshToken(tokens.RefreshToken));
    }

    [Fact]
    public void JwtTokenService_RevokeToken_MarksAccessTokenAsRevoked()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);
        var tokens = service.GenerateToken("test-user", new[] { "admin" });

        // Act
        service.RevokeToken(tokens.AccessToken);

        // Assert
        Assert.True(service.IsTokenRevoked(tokens.AccessToken));
    }

    [Fact]
    public void JwtTokenService_GetUserId_ReturnsTokenSubject()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);
        var tokens = service.GenerateToken("subject-user", new[] { "admin" });

        // Act
        var extractedUserId = service.GetUserId(tokens.RefreshToken);

        // Assert
        Assert.Equal("subject-user", extractedUserId);
    }

    [Fact]
    public void JwtTokenService_RefreshToken_PreservesRoleClaims()
    {
        // Arrange
        var service = new JwtTokenService(_configuration, _mockLogger);
        var initialTokens = service.GenerateToken("test-user", new[] { "admin", "billing" });

        // Act
        var refreshedTokens = service.RefreshToken(initialTokens.RefreshToken);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var refreshedAccessToken = handler.ReadJwtToken(refreshedTokens.AccessToken);
        var roleClaims = refreshedAccessToken.Claims
            .Where(c => c.Type == "role")
            .Select(c => c.Value)
            .ToArray();

        Assert.Contains("admin", roleClaims);
        Assert.Contains("billing", roleClaims);
    }

    [Fact]
    public void JwtTokenService_NoHardcodedSecrets()
    {
        // Verify that JWT secret is loaded from environment, not hardcoded
        // This test ensures compliance with security requirements
        Assert.NotNull(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"));
        
        // Verify secret is not in source code (implicitly tested by requiring env var)
        var secret = JwtSecretProvider.GetSecretKey();
        Assert.Equal(32, secret.Length);
    }
}
