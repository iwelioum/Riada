using Riada.Domain.Entities.Membership;

namespace Riada.Domain.Interfaces.Repositories;

public interface IContractRepository : IGenericRepository<Contract>
{
    Task<Contract?> GetLatestActiveAsync(uint memberId, CancellationToken ct = default);
    Task<Contract?> GetWithOptionsAsync(uint contractId, CancellationToken ct = default);
    Task<IReadOnlyList<Contract>> GetByMemberIdAsync(uint memberId, CancellationToken ct = default);
}
