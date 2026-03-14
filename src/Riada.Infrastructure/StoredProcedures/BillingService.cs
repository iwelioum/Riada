using System.Data;
using Dapper;
using MySqlConnector;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Infrastructure.StoredProcedures;

public class BillingService : IBillingService
{
    private readonly string _connectionString;

    public BillingService(string connectionString) => _connectionString = connectionString;

    public async Task<string> GenerateMonthlyInvoiceAsync(uint contractId, CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_contract_id", contractId, DbType.UInt32);
        parameters.Add("p_result", dbType: DbType.String, direction: ParameterDirection.Output, size: 100);

        await connection.ExecuteAsync(
            "sp_GenerateMonthlyInvoice",
            parameters,
            commandType: CommandType.StoredProcedure);

        return parameters.Get<string>("p_result");
    }

    public async Task<int> ExpireElapsedInvoicesAsync(CancellationToken ct = default)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("p_count", dbType: DbType.Int32, direction: ParameterDirection.Output);

        await connection.ExecuteAsync(
            "sp_ExpireElapsedInvoices",
            parameters,
            commandType: CommandType.StoredProcedure);

        return parameters.Get<int>("p_count");
    }
}
