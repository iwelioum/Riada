using System.Data;
using Dapper;
using MySqlConnector;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Infrastructure.StoredProcedures;

public class AnalyticsService : IAnalyticsService
{
    private readonly string _connectionString;

    public AnalyticsService(string connectionString) => _connectionString = connectionString;

    public async Task<IReadOnlyList<(uint ClubId, string ClubName, int VisitorCount, decimal AverageVisitsPerMember)>> GetClubFrequencyAsync(
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        const string sql = @"
            SELECT 
                c.id AS ClubId,
                c.name AS ClubName,
                COUNT(DISTINCT a.member_id) AS VisitorCount,
                CAST(COUNT(a.id) AS DECIMAL(10, 2)) / NULLIF(COUNT(DISTINCT a.member_id), 0) AS AverageVisitsPerMember
            FROM clubs c
            LEFT JOIN accesses a ON a.club_id = c.id
            WHERE a.access_date BETWEEN @DateFrom AND @DateTo
            GROUP BY c.id, c.name
            ORDER BY VisitorCount DESC";

        var result = await connection.QueryAsync<(uint ClubId, string ClubName, int VisitorCount, decimal AverageVisitsPerMember)>(
            sql,
            new { DateFrom = dateFrom, DateTo = dateTo });

        return result.ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<(uint OptionId, string OptionName, int SubscriptionCount, decimal PopularityPercentage)>> GetOptionPopularityAsync(
        CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        const string sql = @"
            SELECT 
                po.id AS OptionId,
                po.name AS OptionName,
                COUNT(DISTINCT spo.subscription_plan_id) AS SubscriptionCount,
                CAST(COUNT(DISTINCT spo.subscription_plan_id) AS DECIMAL(10, 2)) / 
                    NULLIF((SELECT COUNT(*) FROM subscription_plans), 0) * 100 AS PopularityPercentage
            FROM plan_options po
            LEFT JOIN subscription_plan_options spo ON spo.plan_option_id = po.id
            GROUP BY po.id, po.name
            ORDER BY SubscriptionCount DESC";

        var result = await connection.QueryAsync<(uint OptionId, string OptionName, int SubscriptionCount, decimal PopularityPercentage)>(sql);

        return result.ToList().AsReadOnly();
    }

    public async Task<(bool IsHealthy, string Status, int TotalMembers, int ActiveContracts, int PendingInvoices)> RunSystemHealthCheckAsync(
        CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        const string sql = @"
            SELECT 
                (SELECT COUNT(*) FROM members) AS TotalMembers,
                (SELECT COUNT(*) FROM contracts WHERE end_date IS NULL OR end_date > CURDATE()) AS ActiveContracts,
                (SELECT COUNT(*) FROM invoices WHERE status = 'Pending') AS PendingInvoices";

        using var reader = await connection.QueryMultipleAsync(sql);
        var data = await reader.ReadSingleAsync<(int TotalMembers, int ActiveContracts, int PendingInvoices)>();

        // Simple health check logic
        var isHealthy = data.TotalMembers > 0 && data.ActiveContracts > 0;
        var status = isHealthy ? "Healthy" : "Unhealthy";

        return (isHealthy, status, data.TotalMembers, data.ActiveContracts, data.PendingInvoices);
    }
}
