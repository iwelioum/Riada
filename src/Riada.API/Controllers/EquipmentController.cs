using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Equipment;
using Riada.Application.UseCases.Equipment;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] uint? clubId,
        [FromQuery] string? status = null,
        [FromServices] ListEquipmentUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var request = new ListEquipmentRequest(clubId, status);
        var response = await useCase.ExecuteAsync(request, ct);
        return Ok(response);
    }

    [HttpPost("maintenance")]
    [Authorize]
    public async Task<IActionResult> CreateMaintenanceTicket(
        [FromBody] CreateMaintenanceTicketRequest request,
        [FromServices] CreateMaintenanceTicketUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return Ok(response);
    }

    [HttpPatch("maintenance/{ticketId:uint}")]
    [Authorize]
    public async Task<IActionResult> UpdateTicketStatus(
        uint ticketId,
        [FromBody] UpdateTicketStatusRequest request,
        [FromServices] UpdateTicketStatusUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(ticketId, request, ct);
        return Ok(response);
    }
}
