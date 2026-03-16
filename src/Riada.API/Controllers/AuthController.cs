using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.API.Security;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ITokenService tokenService, ILogger<AuthController> logger)
    {
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
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
        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest("User ID is required.");

        if (request.Roles == null || request.Roles.Length == 0)
            return BadRequest("At least one role is required.");

        try
        {
            var tokenResponse = _tokenService.GenerateToken(request.UserId, request.Roles);
            return Ok(tokenResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token generation failed for user {UserId}", request.UserId);
            return StatusCode(500, "Token generation failed.");
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
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest("Refresh token is required.");

        try
        {
            var response = _tokenService.RefreshToken(request.RefreshToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid refresh token attempted");
            return Unauthorized("Refresh token is invalid or expired.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed");
            return StatusCode(500, "Token refresh failed.");
        }
    }
}

public record GenerateTokenRequest(string UserId, string[] Roles);
public record RefreshTokenRequest(string RefreshToken);
