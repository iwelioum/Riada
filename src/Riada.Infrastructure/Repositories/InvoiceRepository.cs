using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.Billing;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class InvoiceRepository : GenericRepository<Invoice>, IInvoiceRepository
{
    public InvoiceRepository(RiadaDbContext context) : base(context) { }

    public async Task<Invoice?> GetWithLinesAndPaymentsAsync(uint invoiceId, CancellationToken ct = default)
        => await DbSet
            .Include(i => i.Lines)
            .Include(i => i.Payments)
            .Include(i => i.Contract)
                .ThenInclude(c => c!.Plan)
            .Include(i => i.Contract)
                .ThenInclude(c => c!.Member)
            .FirstOrDefaultAsync(i => i.Id == invoiceId, ct);

    public async Task<IReadOnlyList<Invoice>> GetByContractIdAsync(uint contractId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(i => i.ContractId == contractId)
            .OrderByDescending(i => i.IssuedOn)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Invoice>> GetOverdueAsync(CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(i => i.Status == InvoiceStatus.Overdue || i.Status == InvoiceStatus.PartiallyPaid)
            .Where(i => i.DueDate < DateOnly.FromDateTime(DateTime.UtcNow))
            .OrderBy(i => i.DueDate)
            .ToListAsync(ct);
}
