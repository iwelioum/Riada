using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Equipment;
using Riada.Application.UseCases.Equipment;
using Riada.Domain.Enums;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] uint? clubId,
        [FromQuery, StringLength(30)] string? status = null,
        [FromServices] ListEquipmentUseCase useCase = default!,
        CancellationToken ct = default)
    {
        string? normalizedStatus = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            normalizedStatus = status.Trim();
            if (!Enum.TryParse<EquipmentStatus>(normalizedStatus, ignoreCase: true, out _))
                return BadRequest("Invalid equipment status filter.");
        }

        var request = new ListEquipmentRequest(clubId, normalizedStatus);
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

    [HttpPatch("maintenance/{ticketId:int:min(1)}")]
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
