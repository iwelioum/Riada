using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Courses;
using Riada.Application.UseCases.Courses;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    [HttpGet("sessions")]
    public async Task<IActionResult> GetUpcomingSessions(
        [FromQuery] uint clubId,
        [FromQuery] int days = 14,
        [FromServices] GetUpcomingSessionsUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(clubId, days, ct);
        return Ok(response);
    }

    [HttpPost("sessions/{sessionId:int}/book")]
    public async Task<IActionResult> BookSession(
        uint sessionId,
        [FromBody] BookSessionRequest request,
        [FromServices] BookSessionUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var result = await useCase.ExecuteAsync(request with { SessionId = sessionId }, ct);
        return Ok(new { Message = result });
    }

    [HttpDelete("bookings/{memberId:int:min(1)}/{sessionId:int:min(1)}")]
    public async Task<IActionResult> CancelBooking(
        uint memberId,
        uint sessionId,
        [FromServices] CancelBookingUseCase useCase = default!,
        CancellationToken ct = default)
    {
        await useCase.ExecuteAsync(memberId, sessionId, ct);
        return Ok(new { Message = "Booking cancelled successfully" });
    }
}
