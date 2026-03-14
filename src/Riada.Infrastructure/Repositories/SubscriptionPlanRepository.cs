using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class SubscriptionPlanRepository : GenericRepository<SubscriptionPlan>, ISubscriptionPlanRepository
{
    public SubscriptionPlanRepository(RiadaDbContext context) : base(context) { }

    public async Task<SubscriptionPlan?> GetByNameAsync(string planName, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(sp => sp.PlanName == planName, ct);

    public async Task<SubscriptionPlan?> GetWithOptionsAsync(uint planId, CancellationToken ct = default)
        => await DbSet
            .Include(sp => sp.PlanOptions)
            .FirstOrDefaultAsync(sp => sp.Id == planId, ct);

    public async Task<IReadOnlyList<SubscriptionPlan>> GetAllWithOptionsAsync(CancellationToken ct = default)
        => await DbSet
            .Include(sp => sp.PlanOptions)
            .OrderBy(sp => sp.PlanName)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<SubscriptionPlan>> GetActiveAsync(CancellationToken ct = default)
        => await DbSet
            .Include(sp => sp.PlanOptions)
            .Where(sp => sp.Contracts.Any(c => c.Status == ContractStatus.Active))
            .ToListAsync(ct);
}
