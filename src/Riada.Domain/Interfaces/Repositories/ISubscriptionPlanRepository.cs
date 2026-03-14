using Riada.Domain.Entities.Membership;

namespace Riada.Domain.Interfaces.Repositories;

public interface ISubscriptionPlanRepository : IGenericRepository<SubscriptionPlan>
{
    Task<SubscriptionPlan?> GetByNameAsync(string planName, CancellationToken ct = default);
    Task<SubscriptionPlan?> GetWithOptionsAsync(uint planId, CancellationToken ct = default);
    Task<IReadOnlyList<SubscriptionPlan>> GetAllWithOptionsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<SubscriptionPlan>> GetActiveAsync(CancellationToken ct = default);
}
