namespace Riada.Domain.Interfaces.StoredProcedures;

public interface IBillingService
{
    /// <summary>Calls sp_GenerateMonthlyInvoice</summary>
    Task<string> GenerateMonthlyInvoiceAsync(uint contractId, CancellationToken ct = default);

    /// <summary>Calls sp_ExpireElapsedInvoices</summary>
    Task<int> ExpireElapsedInvoicesAsync(CancellationToken ct = default);
}
