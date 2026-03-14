using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;

namespace Riada.Domain.Interfaces.Repositories;

public interface IMemberRepository : IGenericRepository<Member>
{
    Task<Member?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Member?> GetWithContractsAsync(uint id, CancellationToken ct = default);
    Task<(IReadOnlyList<Member> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        MemberStatus? statusFilter = null,
        string? searchTerm = null,
        CancellationToken ct = default);
}
