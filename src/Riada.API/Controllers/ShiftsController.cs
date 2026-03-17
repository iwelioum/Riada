using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Shifts;
using Riada.Application.UseCases.Shifts;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShiftsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWeek(
        [FromQuery] uint clubId,
        [FromQuery] DateOnly weekStart,
        [FromServices] GetWeekShiftsUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var shifts = await useCase.ExecuteAsync(clubId, weekStart, ct);
        return Ok(shifts);
    }

    [HttpPost]
    [Authorize(Policy = "BillingOps")]
    public async Task<IActionResult> Create(
        [FromBody] CreateShiftRequest request,
        [FromServices] CreateShiftUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var shift = await useCase.ExecuteAsync(request, ct);
        return CreatedAtAction(nameof(GetWeek), new { clubId = shift.ClubId, weekStart = shift.Date }, shift);
    }

    [HttpDelete("{id:int:min(1)}")]
    [Authorize(Policy = "BillingOps")]
    public async Task<IActionResult> Delete(
        uint id,
        [FromServices] DeleteShiftUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var deleted = await useCase.ExecuteAsync(id, ct);
        return deleted ? Ok(new { Message = "Shift deleted" }) : NotFound();
    }
}
