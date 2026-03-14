using System.Data;
using Dapper;
using MySqlConnector;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Infrastructure.StoredProcedures;

public class ContractLifecycleService : IContractLifecycleService
{
    private readonly string _connectionString;

    public ContractLifecycleService(string connectionString) => _connectionString = connectionString;

    public async Task<string> FreezeContractAsync(uint contractId, uint durationDays, CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_contract_id", contractId, DbType.UInt32);
        parameters.Add("p_duration_days", durationDays, DbType.UInt32);
        parameters.Add("p_result", dbType: DbType.String, direction: ParameterDirection.Output, size: 100);

        await connection.ExecuteAsync(
            "sp_FreezeContract",
            parameters,
            commandType: CommandType.StoredProcedure);

        return parameters.Get<string>("p_result");
    }

    public async Task<string> RenewContractAsync(uint contractId, CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_contract_id", contractId, DbType.UInt32);
        parameters.Add("p_result", dbType: DbType.String, direction: ParameterDirection.Output, size: 100);

        await connection.ExecuteAsync(
            "sp_RenewContract",
            parameters,
            commandType: CommandType.StoredProcedure);

        return parameters.Get<string>("p_result");
    }

    public async Task<int> ExpireElapsedContractsAsync(CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_count", dbType: DbType.Int32, direction: ParameterDirection.Output);

        await connection.ExecuteAsync(
            "sp_ExpireElapsedContracts",
            parameters,
            commandType: CommandType.StoredProcedure);

        return parameters.Get<int>("p_count");
    }
}
