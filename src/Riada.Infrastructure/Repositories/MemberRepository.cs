using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class MemberRepository : GenericRepository<Member>, IMemberRepository
{
    public MemberRepository(RiadaDbContext context) : base(context) { }

    public async Task<Member?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(m => m.Email == email, ct);

    public async Task<Member?> GetWithContractsAsync(uint id, CancellationToken ct = default)
        => await DbSet
            .Include(m => m.Contracts)
                .ThenInclude(c => c.Plan)
            .Include(m => m.Contracts)
                .ThenInclude(c => c.HomeClub)
            .Include(m => m.Contracts)
                .ThenInclude(c => c.ContractOptions)
                    .ThenInclude(co => co.Option)
            .Include(m => m.Contracts)
                .ThenInclude(c => c.Invoices)
            .FirstOrDefaultAsync(m => m.Id == id, ct);

    public async Task<(IReadOnlyList<Member> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        MemberStatus? statusFilter = null,
        string? searchTerm = null,
        CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking().AsQueryable();

        if (statusFilter.HasValue)
            query = query.Where(m => m.Status == statusFilter.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(m =>
                m.LastName.Contains(searchTerm) ||
                m.FirstName.Contains(searchTerm) ||
                m.Email.Contains(searchTerm));

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderBy(m => m.LastName).ThenBy(m => m.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }
}
