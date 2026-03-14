using Riada.Application.DTOs.Responses.Analytics;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Analytics;

public class GetOptionPopularityUseCase
{
    private readonly IAnalyticsService _analyticsService;

    public GetOptionPopularityUseCase(IAnalyticsService analyticsService)
        => _analyticsService = analyticsService;

    public async Task<IReadOnlyList<OptionPopularityResponse>> ExecuteAsync(
        CancellationToken ct = default)
    {
        var result = await _analyticsService.GetOptionPopularityAsync(ct);
        
        return result.Select(r => new OptionPopularityResponse(r.OptionId, r.OptionName, r.SubscriptionCount, r.PopularityPercentage))
            .ToList()
            .AsReadOnly();
    }
}
