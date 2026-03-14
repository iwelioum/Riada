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
            .Where(g => g.SponsorMemberId == sponsorMemberId)
            .ToListAsync(ct);

    public async Task<Guest?> GetActiveGuestForSponsorAsync(uint sponsorMemberId, CancellationToken ct = default)
        => await DbSet
            .FirstOrDefaultAsync(g => g.SponsorMemberId == sponsorMemberId && g.Status == GuestStatus.Active, ct);
}
