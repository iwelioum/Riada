using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class EmployeeRepository : GenericRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(RiadaDbContext context) : base(context) { }

    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(e => e.Email == email, ct);

    public async Task<Employee?> GetByIdWithClubAsync(uint id, CancellationToken ct = default)
        => await DbSet.Include(e => e.Club).FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<(IReadOnlyList<Employee> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        uint? clubId = null,
        string? searchTerm = null,
        CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking().Include(e => e.Club).AsQueryable();

        if (clubId.HasValue)
            query = query.Where(e => e.ClubId == clubId.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(e =>
                e.LastName.Contains(searchTerm) ||
                e.FirstName.Contains(searchTerm) ||
                e.Email.Contains(searchTerm));

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Employee>> GetByClubIdAsync(uint clubId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(e => e.ClubId == clubId)
            .OrderBy(e => e.LastName)
            .ToListAsync(ct);
}
