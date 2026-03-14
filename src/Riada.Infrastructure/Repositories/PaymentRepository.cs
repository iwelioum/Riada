using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.Billing;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
{
    public PaymentRepository(RiadaDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Payment>> GetByInvoiceIdAsync(uint invoiceId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(p => p.InvoiceId == invoiceId)
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Payment>> GetByStatusAsync(PaymentStatus status, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(p => p.Status == status)
            .Include(p => p.Invoice)
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync(ct);

    public async Task<Payment?> GetWithInvoiceAsync(uint paymentId, CancellationToken ct = default)
        => await DbSet
            .Include(p => p.Invoice)
                .ThenInclude(i => i.Contract)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct);

    public async Task<IReadOnlyList<Payment>> GetFailedPaymentsAsync(CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Failed)
            .Include(p => p.Invoice)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync(ct);

    public async Task<decimal> GetTotalAmountByInvoiceAsync(uint invoiceId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(p => p.InvoiceId == invoiceId && p.Status == PaymentStatus.Succeeded)
            .SumAsync(p => p.Amount, ct);
}
