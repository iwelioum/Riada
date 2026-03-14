using Riada.Domain.Entities.Billing;

namespace Riada.Domain.Interfaces.Repositories;

public interface IInvoiceRepository : IGenericRepository<Invoice>
{
    Task<Invoice?> GetWithLinesAndPaymentsAsync(uint invoiceId, CancellationToken ct = default);
    Task<IReadOnlyList<Invoice>> GetByContractIdAsync(uint contractId, CancellationToken ct = default);
    Task<IReadOnlyList<Invoice>> GetOverdueAsync(CancellationToken ct = default);
}
