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
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ITokenService tokenService,
        IAuthAbuseProtectionService abuseProtectionService,
        ILogger<AuthController> logger)
    {
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        _abuseProtectionService = abuseProtectionService ?? throw new ArgumentNullException(nameof(abuseProtectionService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
        [FromBody] RefreshTokenRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest("Refresh token is required.");

        var refreshToken = request.RefreshToken.Trim();
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
        var accessToken = ExtractBearerToken();
        if (string.IsNullOrWhiteSpace(accessToken))
            return BadRequest("Access token is required in Authorization header.");

        try
        {
            _tokenService.RevokeToken(accessToken);

            if (!string.IsNullOrWhiteSpace(request?.RefreshToken))
                _tokenService.RevokeToken(request.RefreshToken.Trim());

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

    private string? ExtractBearerToken()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
            return null;

        var rawHeader = authorizationHeader.ToString();
        const string bearerPrefix = "Bearer ";
        return rawHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase)
            ? rawHeader[bearerPrefix.Length..].Trim()
            : null;
    }
}

public record GenerateTokenRequest(string UserId, string[] Roles);
public record RefreshTokenRequest(string RefreshToken);
public record LogoutRequest(string? RefreshToken);
