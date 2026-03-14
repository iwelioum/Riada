using System.Data;
using Dapper;
using MySqlConnector;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Infrastructure.StoredProcedures;

public class AccessCheckService : IAccessCheckService
{
    private readonly string _connectionString;

    public AccessCheckService(string connectionString) => _connectionString = connectionString;

    public async Task<AccessDecision> CheckMemberAccessAsync(uint memberId, uint clubId, CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_member_id", memberId, DbType.UInt32);
        parameters.Add("p_club_id", clubId, DbType.UInt32);
        parameters.Add("p_decision", dbType: DbType.String, direction: ParameterDirection.Output, size: 10);

        await connection.ExecuteAsync(
            "sp_CheckAccess",
            parameters,
            commandType: CommandType.StoredProcedure);

        var decision = parameters.Get<string>("p_decision");
        return decision == "granted" ? AccessDecision.Granted : AccessDecision.Denied;
    }

    public async Task<AccessDecision> CheckGuestAccessAsync(uint guestId, uint companionMemberId, uint clubId, CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_guest_id", guestId, DbType.UInt32);
        parameters.Add("p_companion_member_id", companionMemberId, DbType.UInt32);
        parameters.Add("p_club_id", clubId, DbType.UInt32);
        parameters.Add("p_decision", dbType: DbType.String, direction: ParameterDirection.Output, size: 10);

        await connection.ExecuteAsync(
            "sp_CheckAccessGuest",
            parameters,
            commandType: CommandType.StoredProcedure);

        var decision = parameters.Get<string>("p_decision");
        return decision == "granted" ? AccessDecision.Granted : AccessDecision.Denied;
    }
}
