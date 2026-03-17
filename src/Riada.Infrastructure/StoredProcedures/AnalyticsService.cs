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
            LEFT JOIN access_log a
                ON a.club_id = c.id
               AND a.access_status = 'granted'
               AND a.accessed_at BETWEEN @DateFrom AND @DateTo
            GROUP BY c.id, c.name
            ORDER BY VisitorCount DESC";

        var fromDateTime = dateFrom.ToDateTime(TimeOnly.MinValue);
        var toDateTime = dateTo.ToDateTime(TimeOnly.MaxValue);

        var result = await connection.QueryAsync<(uint ClubId, string ClubName, int VisitorCount, decimal AverageVisitsPerMember)>(
            sql,
            new { DateFrom = fromDateTime, DateTo = toDateTime });

        return result.ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<(uint OptionId, string OptionName, int SubscriptionCount, decimal PopularityPercentage)>> GetOptionPopularityAsync(
        CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        const string sql = @"
            SELECT 
                so.id AS OptionId,
                so.option_name AS OptionName,
                COUNT(DISTINCT co.contract_id) AS SubscriptionCount,
                ROUND(
                    COUNT(DISTINCT co.contract_id) * 100.0 /
                    NULLIF((SELECT COUNT(*) FROM contracts WHERE status = 'active'), 0),
                    2
                ) AS PopularityPercentage
            FROM contract_options co
            JOIN service_options so ON so.id = co.option_id
            JOIN contracts c ON c.id = co.contract_id
            WHERE c.status = 'active' AND co.removed_on IS NULL
            GROUP BY so.id, so.option_name
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
                (SELECT COUNT(*) FROM members WHERE status = 'active') AS ActiveMembers,
                (SELECT COUNT(*) FROM contracts WHERE status = 'active') AS ActiveContracts,
                (SELECT COUNT(*) FROM invoices WHERE status IN ('issued', 'overdue', 'partially_paid')) AS PendingInvoices";

        using var reader = await connection.QueryMultipleAsync(sql);
        var data = await reader.ReadSingleAsync<(int TotalMembers, int ActiveMembers, int ActiveContracts, int PendingInvoices)>();

        // Simple health check logic
        var isHealthy = data.ActiveMembers > 0 && data.ActiveContracts > 0;
        var status = isHealthy ? "Healthy" : "Unhealthy";

        return (isHealthy, status, data.TotalMembers, data.ActiveContracts, data.PendingInvoices);
    }

    public async Task<IReadOnlyList<(long Id, bool IsGuest, uint PersonId, string PersonName, uint ClubId, string ClubName, DateTime AccessedAt, string AccessStatus, string? DenialReason)>> GetRecentAccessLogAsync(
        int limit = 50,
        CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        const string sql = @"
            SELECT
                CAST(al.id AS SIGNED)              AS Id,
                FALSE                              AS IsGuest,
                al.member_id                       AS PersonId,
                CONCAT(m.first_name, ' ', m.last_name) AS PersonName,
                al.club_id                         AS ClubId,
                c.name                             AS ClubName,
                al.accessed_at                     AS AccessedAt,
                al.access_status                   AS AccessStatus,
                al.denial_reason                   AS DenialReason
            FROM access_log al
            LEFT JOIN members m ON m.id = al.member_id
            LEFT JOIN clubs   c ON c.id = al.club_id

            UNION ALL

            SELECT
                CAST(gal.id AS SIGNED)             AS Id,
                TRUE                               AS IsGuest,
                gal.guest_id                       AS PersonId,
                CONCAT(g.first_name, ' ', g.last_name) AS PersonName,
                gal.club_id                        AS ClubId,
                c.name                             AS ClubName,
                gal.accessed_at                    AS AccessedAt,
                gal.access_status                  AS AccessStatus,
                gal.denial_reason                  AS DenialReason
            FROM guest_access_log gal
            LEFT JOIN guests g ON g.id = gal.guest_id
            LEFT JOIN clubs  c ON c.id = gal.club_id

            ORDER BY AccessedAt DESC
            LIMIT @Limit";

        var rows = await connection.QueryAsync<AccessLogRow>(sql, new { Limit = limit });

        return rows.Select(r => (
            (long)r.Id,
            r.IsGuest,
            (uint)r.PersonId,
            r.PersonName ?? "Unknown",
            (uint)r.ClubId,
            r.ClubName ?? "Unknown",
            r.AccessedAt,
            r.AccessStatus ?? "unknown",
            r.DenialReason
        )).ToList().AsReadOnly();
    }

    private sealed class AccessLogRow
    {
        public long Id { get; init; }
        public bool IsGuest { get; init; }
        public long PersonId { get; init; }
        public string? PersonName { get; init; }
        public long ClubId { get; init; }
        public string? ClubName { get; init; }
        public DateTime AccessedAt { get; init; }
        public string? AccessStatus { get; init; }
        public string? DenialReason { get; init; }
    }
}
