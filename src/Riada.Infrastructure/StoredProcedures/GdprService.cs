using System.Data;
using Dapper;
using MySqlConnector;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Infrastructure.StoredProcedures;

public class GdprService : IGdprService
{
    private readonly string _connectionString;

    public GdprService(string connectionString) => _connectionString = connectionString;

    public async Task<string> AnonymizeMemberAsync(uint memberId, string requestedBy, CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_member_id", memberId, DbType.UInt32);
        parameters.Add("p_requested_by", requestedBy, DbType.String, size: 100);
        parameters.Add("p_result", dbType: DbType.String, direction: ParameterDirection.Output, size: 100);

        await connection.ExecuteAsync(
            "sp_AnonymizeMember",
            parameters,
            commandType: CommandType.StoredProcedure);

        return parameters.Get<string>("p_result");
    }
}
