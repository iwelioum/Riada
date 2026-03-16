using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.AccessControl;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class GuestRepository : GenericRepository<Guest>, IGuestRepository
{
    public GuestRepository(RiadaDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Guest>> GetBySponsorAsync(uint sponsorMemberId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Include(g => g.SponsorMember)
            .Where(g => g.SponsorMemberId == sponsorMemberId)
            .ToListAsync(ct);

    public async Task<Guest?> GetActiveGuestForSponsorAsync(uint sponsorMemberId, CancellationToken ct = default)
        => await DbSet
            .Include(g => g.SponsorMember)
            .FirstOrDefaultAsync(g => g.SponsorMemberId == sponsorMemberId && g.Status == GuestStatus.Active, ct);

    public async Task<(IReadOnlyList<Guest> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking()
            .Include(g => g.SponsorMember);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderBy(g => g.LastName).ThenBy(g => g.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }
}

