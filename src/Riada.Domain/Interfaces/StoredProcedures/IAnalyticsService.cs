namespace Riada.Domain.Interfaces.StoredProcedures;

public interface IAnalyticsService
{
    /// <summary>Calls sp_GetClubFrequency</summary>
    Task<IReadOnlyList<(uint ClubId, string ClubName, int VisitorCount, decimal AverageVisitsPerMember)>> GetClubFrequencyAsync(
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken ct = default);

    /// <summary>Calls sp_GetOptionPopularity</summary>
    Task<IReadOnlyList<(uint OptionId, string OptionName, int SubscriptionCount, decimal PopularityPercentage)>> GetOptionPopularityAsync(CancellationToken ct = default);

    /// <summary>Calls sp_RunSystemHealthCheck</summary>
    Task<(bool IsHealthy, string Status, int TotalMembers, int ActiveContracts, int PendingInvoices)> RunSystemHealthCheckAsync(CancellationToken ct = default);

    /// <summary>Returns recent access log entries (member and guest combined)</summary>
    Task<IReadOnlyList<(long Id, bool IsGuest, uint PersonId, string PersonName, uint ClubId, string ClubName, DateTime AccessedAt, string AccessStatus, string? DenialReason)>> GetRecentAccessLogAsync(int limit = 50, CancellationToken ct = default);
}
