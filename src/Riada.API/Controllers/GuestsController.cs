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
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromServices] ListGuestsUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(page, pageSize, ct);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Register(
        [FromBody] RegisterGuestRequest request,
        [FromServices] RegisterGuestUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return CreatedAtAction(null, new { id = response.Id }, response);
    }

    [HttpPost("{id:int:min(1)}/ban")]
    [Authorize]
    public async Task<IActionResult> Ban(
        uint id,
        [FromServices] BanGuestUseCase useCase = default!,
        CancellationToken ct = default)
    {
        await useCase.ExecuteAsync(id, ct);
        return Ok(new { Message = "Guest banned successfully" });
    }
}
