using Riada.Domain.Entities.Billing;
using Riada.Domain.Enums;

namespace Riada.Domain.Interfaces.Repositories;

public interface IPaymentRepository : IGenericRepository<Payment>
{
    Task<IReadOnlyList<Payment>> GetByInvoiceIdAsync(uint invoiceId, CancellationToken ct = default);
    Task<IReadOnlyList<Payment>> GetByStatusAsync(PaymentStatus status, CancellationToken ct = default);
    Task<Payment?> GetWithInvoiceAsync(uint paymentId, CancellationToken ct = default);
    Task<IReadOnlyList<Payment>> GetFailedPaymentsAsync(CancellationToken ct = default);
    Task<decimal> GetTotalAmountByInvoiceAsync(uint invoiceId, CancellationToken ct = default);
}
