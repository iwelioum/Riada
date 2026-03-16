using Riada.Application.DTOs.Requests.Analytics;
using Riada.Application.DTOs.Responses.Analytics;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Analytics;

public class GetClubFrequencyReportUseCase
{
    private readonly IAnalyticsService _analyticsService;

    public GetClubFrequencyReportUseCase(IAnalyticsService analyticsService)
        => _analyticsService = analyticsService;

    public async Task<IReadOnlyList<ClubFrequencyResponse>> ExecuteAsync(
        GetClubFrequencyReportRequest request,
        CancellationToken ct = default)
    {
        var dateFrom = request.DateFrom ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var dateTo = request.DateTo ?? DateOnly.FromDateTime(DateTime.UtcNow);

        if (dateFrom > dateTo)
            throw new ArgumentException("DateFrom cannot be greater than DateTo.", nameof(request));

        if (dateTo.DayNumber - dateFrom.DayNumber > 366)
            throw new ArgumentException("Date range cannot exceed 366 days.", nameof(request));

        var result = await _analyticsService.GetClubFrequencyAsync(dateFrom, dateTo, ct);
        
        return result.Select(r => new ClubFrequencyResponse(r.ClubId, r.ClubName, r.VisitorCount, r.AverageVisitsPerMember))
            .ToList()
            .AsReadOnly();
    }
}
