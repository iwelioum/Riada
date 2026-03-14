namespace Riada.Domain.Interfaces.StoredProcedures;

public interface IContractLifecycleService
{
    /// <summary>Calls sp_FreezeContract</summary>
    Task<string> FreezeContractAsync(uint contractId, uint durationDays, CancellationToken ct = default);

    /// <summary>Calls sp_RenewContract</summary>
    Task<string> RenewContractAsync(uint contractId, CancellationToken ct = default);

    /// <summary>Calls sp_ExpireElapsedContracts</summary>
    Task<int> ExpireElapsedContractsAsync(CancellationToken ct = default);
}
