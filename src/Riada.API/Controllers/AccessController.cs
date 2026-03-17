using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Access;
using Riada.Application.UseCases.Access;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccessController : ControllerBase
{
    [HttpPost("member")]
    [Authorize(Policy = "GateAccess")]
    public async Task<IActionResult> CheckMemberAccess(
        [FromBody] CheckMemberAccessRequest request,
        [FromServices] CheckMemberAccessUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return Ok(response);
    }

    [HttpPost("guest")]
    [Authorize(Policy = "GateAccess")]
    public async Task<IActionResult> CheckGuestAccess(
        [FromBody] CheckGuestAccessRequest request,
        [FromServices] CheckGuestAccessUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return Ok(response);
    }

    [HttpGet("log")]
    [Authorize(Policy = "GateAccess")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> GetLog(
        [FromQuery, Range(1, 200)] int limit = 50,
        [FromServices] IAnalyticsService analyticsService = default!,
        CancellationToken ct = default)
    {
        var entries = await analyticsService.GetRecentAccessLogAsync(limit, ct);
        var result = entries.Select(e => new
        {
            id = e.Id,
            isGuest = e.IsGuest,
            personId = e.PersonId,
            personName = e.PersonName,
            clubId = e.ClubId,
            clubName = e.ClubName,
            accessedAt = e.AccessedAt,
            accessStatus = e.AccessStatus,
            denialReason = e.DenialReason
        });
        return Ok(result);
    }
}
