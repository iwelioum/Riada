using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Guests;
using Riada.Application.UseCases.Guests;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GuestsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromServices] ListGuestsUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(ct);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Register(
        [FromBody] RegisterGuestRequest request,
        [FromServices] RegisterGuestUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return CreatedAtAction(null, new { id = response.Id }, response);
    }

    [HttpPost("{id:int:min(1)}/ban")]
    [Authorize]
    public async Task<IActionResult> Ban(
        uint id,
        [FromServices] BanGuestUseCase useCase,
        CancellationToken ct)
    {
        await useCase.ExecuteAsync(id, ct);
        return Ok(new { Message = "Guest banned successfully" });
    }
}
