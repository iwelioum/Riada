using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Riada.API.Security;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;
    private readonly IAuthAbuseProtectionService _abuseProtectionService;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<AuthController> _logger;
    private readonly string _accessTokenCookieName;
    private readonly string _refreshTokenCookieName;
    private readonly int _accessTokenExpirationMinutes;
    private readonly int _refreshTokenExpirationDays;

    public AuthController(
        ITokenService tokenService,
        IAuthAbuseProtectionService abuseProtectionService,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<AuthController> logger)
    {
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        _abuseProtectionService = abuseProtectionService ?? throw new ArgumentNullException(nameof(abuseProtectionService));
        ArgumentNullException.ThrowIfNull(configuration);
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        _accessTokenCookieName = AuthCookieSettings.GetAccessTokenCookieName(configuration);
        _refreshTokenCookieName = AuthCookieSettings.GetRefreshTokenCookieName(configuration);

        var jwtConfig = configuration.GetSection("Jwt");
        _accessTokenExpirationMinutes = ReadPositiveInt(jwtConfig["AccessTokenExpirationMinutes"], fallback: 60);
        _refreshTokenExpirationDays = ReadPositiveInt(jwtConfig["RefreshTokenExpirationDays"], fallback: 7);
    }

    /// <summary>
    /// Generates a new JWT token pair (access + refresh).
    /// In production, call this after authenticating the user with credentials.
    /// </summary>
    [HttpPost("token")]
    [AllowAnonymous]
    public IActionResult GenerateToken(
        [FromBody] GenerateTokenRequest request)
    {
        if (request is null)
            return BadRequest("Request body is required.");

        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest("User ID is required.");

        if (request.Roles == null || request.Roles.Length == 0)
            return BadRequest("At least one role is required.");

        var normalizedUserId = request.UserId.Trim();
        if (normalizedUserId.Length > 128)
            return BadRequest("User ID exceeds maximum length of 128.");

        var normalizedRoles = request.Roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Select(role => role.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (normalizedRoles.Length == 0)
            return BadRequest("At least one valid role is required.");

        if (!_abuseProtectionService.IsTokenGenerationAllowed(normalizedUserId, out var retryAfter))
        {
            return TooManyRequests(
                "Too many token generation attempts for this user. Please retry later.",
                retryAfter);
        }

        try
        {
            var tokenResponse = _tokenService.GenerateToken(normalizedUserId, normalizedRoles);
            WriteAuthCookies(tokenResponse.AccessToken, tokenResponse.RefreshToken);
            return Ok(tokenResponse);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Token generation request rejected for user {UserId}", normalizedUserId);
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Refreshes an access token using a valid refresh token.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public IActionResult RefreshToken(
        [FromBody] RefreshTokenRequest? request = null)
    {
        var refreshToken = request?.RefreshToken?.Trim();
        if (string.IsNullOrWhiteSpace(refreshToken)
            && Request.Cookies.TryGetValue(_refreshTokenCookieName, out var cookieRefreshToken))
        {
            refreshToken = cookieRefreshToken?.Trim();
        }

        if (string.IsNullOrWhiteSpace(refreshToken))
            return BadRequest("Refresh token is required.");

        var subject = _tokenService.GetUserId(refreshToken) ?? InputSanitizer.HashSensitiveData(refreshToken);

        if (!_abuseProtectionService.IsRefreshAllowed(subject, out var retryAfter))
        {
            return TooManyRequests(
                "Too many refresh attempts for this token subject. Please retry later.",
                retryAfter);
        }

        try
        {
            var response = _tokenService.RefreshToken(refreshToken);
            WriteAuthCookies(response.AccessToken, response.RefreshToken);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Malformed refresh token request");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid refresh token attempted");
            return Unauthorized("Refresh token is invalid or expired.");
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning(ex, "Refresh token signature or claims validation failed");
            return Unauthorized("Refresh token is invalid or expired.");
        }
    }

    /// <summary>
    /// Revokes active access token and optional refresh token.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout([FromBody] LogoutRequest? request = null)
    {
        var accessToken = ExtractAccessToken();
        if (string.IsNullOrWhiteSpace(accessToken))
            return BadRequest("Access token is required in Authorization header or secure cookie.");

        try
        {
            _tokenService.RevokeToken(accessToken);

            var refreshToken = request?.RefreshToken?.Trim();
            if (string.IsNullOrWhiteSpace(refreshToken)
                && Request.Cookies.TryGetValue(_refreshTokenCookieName, out var cookieRefreshToken))
            {
                refreshToken = cookieRefreshToken?.Trim();
            }

            if (!string.IsNullOrWhiteSpace(refreshToken))
                _tokenService.RevokeToken(refreshToken);

            ClearAuthCookies();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
            _logger.LogInformation("User {UserId} logged out and token revocation applied", userId);

            return Ok(new { Message = "Logout successful. Token revocation applied." });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Logout request rejected due to malformed token data");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Logout token revocation failed due to invalid token metadata");
            return BadRequest("Token revocation failed.");
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning(ex, "Logout token validation failed");
            return BadRequest("Token revocation failed.");
        }
    }

    private IActionResult TooManyRequests(string message, TimeSpan retryAfter)
    {
        Response.Headers["Retry-After"] = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds)).ToString();
        return StatusCode(StatusCodes.Status429TooManyRequests, message);
    }

    private string? ExtractAccessToken()
    {
        if (Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
        {
            var rawHeader = authorizationHeader.ToString();
            const string bearerPrefix = "Bearer ";
            if (rawHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
            {
                var bearerToken = rawHeader[bearerPrefix.Length..].Trim();
                if (!string.IsNullOrWhiteSpace(bearerToken))
                    return bearerToken;
            }
        }

        return Request.Cookies.TryGetValue(_accessTokenCookieName, out var cookieToken)
            ? cookieToken?.Trim()
            : null;
    }

    private void WriteAuthCookies(string accessToken, string refreshToken)
    {
        Response.Cookies.Append(
            _accessTokenCookieName,
            accessToken,
            CreateCookieOptions(TimeSpan.FromMinutes(_accessTokenExpirationMinutes)));

        Response.Cookies.Append(
            _refreshTokenCookieName,
            refreshToken,
            CreateCookieOptions(TimeSpan.FromDays(_refreshTokenExpirationDays)));
    }

    private void ClearAuthCookies()
    {
        var deleteOptions = CreateCookieOptions(TimeSpan.Zero);
        Response.Cookies.Delete(_accessTokenCookieName, deleteOptions);
        Response.Cookies.Delete(_refreshTokenCookieName, deleteOptions);
    }

    private CookieOptions CreateCookieOptions(TimeSpan lifetime) => new()
    {
        HttpOnly = true,
        Secure = ShouldUseSecureCookies(),
        SameSite = SameSiteMode.Strict,
        Path = "/",
        IsEssential = true,
        Expires = DateTimeOffset.UtcNow.Add(lifetime)
    };

    private bool ShouldUseSecureCookies() => !_environment.IsDevelopment() || Request.IsHttps;

    private static int ReadPositiveInt(string? rawValue, int fallback) =>
        int.TryParse(rawValue, out var parsed) && parsed > 0 ? parsed : fallback;
}

public record GenerateTokenRequest(string UserId, string[] Roles);
public record RefreshTokenRequest(string? RefreshToken);
public record LogoutRequest(string? RefreshToken);
