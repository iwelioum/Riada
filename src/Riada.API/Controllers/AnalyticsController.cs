using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Analytics;
using Riada.Application.UseCases.Analytics;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "BillingOps")]
public class AnalyticsController : ControllerBase
{
    [HttpGet("risk-scores")]
    public async Task<IActionResult> GetRiskScores(
        [FromQuery] int limit = 25,
        [FromServices] GetMemberRiskScoresUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(limit, ct);
        return Ok(response);
    }

    [HttpGet("frequency")]
    public async Task<IActionResult> GetFrequency(
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo,
        [FromServices] GetClubFrequencyReportUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var request = new GetClubFrequencyReportRequest(dateFrom, dateTo);
        var response = await useCase.ExecuteAsync(request, ct);
        return Ok(response);
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetOptions(
        [FromServices] GetOptionPopularityUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(ct);
        return Ok(response);
    }

    [HttpGet("health")]
    public async Task<IActionResult> GetHealth(
        [FromServices] RunSystemHealthCheckUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(ct);
        return Ok(response);
    }
}
