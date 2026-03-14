using Riada.Application.DTOs.Responses.Analytics;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Analytics;

public class RunSystemHealthCheckUseCase
{
    private readonly IAnalyticsService _analyticsService;

    public RunSystemHealthCheckUseCase(IAnalyticsService analyticsService)
        => _analyticsService = analyticsService;

    public async Task<SystemHealthCheckResponse> ExecuteAsync(
        CancellationToken ct = default)
    {
        var result = await _analyticsService.RunSystemHealthCheckAsync(ct);
        
        return new SystemHealthCheckResponse(result.IsHealthy, result.Status, result.TotalMembers, result.ActiveContracts, result.PendingInvoices);
    }
}
