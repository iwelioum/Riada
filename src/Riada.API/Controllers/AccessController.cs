using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Access;
using Riada.Application.UseCases.Access;

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
}
