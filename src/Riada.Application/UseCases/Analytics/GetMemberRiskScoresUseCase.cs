using Dapper;
using MySqlConnector;
using Riada.Application.DTOs.Responses.Analytics;

namespace Riada.Application.UseCases.Analytics;

/// <summary>
/// Executes the risk score CTE query from 08_Select_Queries.sql
/// Uses Dapper directly for complex analytics queries.
/// </summary>
public class GetMemberRiskScoresUseCase
{
    private readonly string _connectionString;

    public GetMemberRiskScoresUseCase(string connectionString)
        => _connectionString = connectionString;

    public async Task<IReadOnlyList<MemberRiskScoreResponse>> ExecuteAsync(int limit = 25, CancellationToken ct = default)
    {
        const string sql = """
            WITH overdue_by_contract AS (
                SELECT
                    i.contract_id,
                    COUNT(*) AS overdue_count
                FROM invoices i
                WHERE i.status IN ('overdue', 'partially_paid')
                  AND i.due_date < CURDATE()
                GROUP BY i.contract_id
            ),
            denied_by_member AS (
                SELECT
                    al.member_id,
                    COUNT(*) AS denied_60d
                FROM access_log al
                WHERE al.access_status = 'denied'
                  AND al.accessed_at >= NOW(3) - INTERVAL 60 DAY
                  AND al.member_id IS NOT NULL
                GROUP BY al.member_id
            )
            SELECT
                m.id AS MemberId,
                m.last_name AS LastName,
                m.first_name AS FirstName,
                sp.plan_name AS PlanName,
                COALESCE(obc.overdue_count, 0) AS OverdueInvoiceCount,
                COALESCE(dbm.denied_60d, 0) AS DeniedAccess60d,
                COALESCE(obc.overdue_count, 0) * 10 + COALESCE(dbm.denied_60d, 0) * 3 AS RiskScore
            FROM contracts c
            JOIN members m ON m.id = c.member_id
            JOIN subscription_plans sp ON sp.id = c.plan_id
            LEFT JOIN overdue_by_contract obc ON obc.contract_id = c.id
            LEFT JOIN denied_by_member dbm ON dbm.member_id = m.id
            WHERE c.status = 'active'
            ORDER BY RiskScore DESC, m.id
            LIMIT @Limit
            """;

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var results = await connection.QueryAsync<MemberRiskScoreResponse>(sql, new { Limit = limit });
        return results.ToList();
    }
}
