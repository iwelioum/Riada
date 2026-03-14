using Riada.Domain.Entities.AccessControl;

namespace Riada.Domain.Interfaces.Repositories;

public interface IGuestRepository : IGenericRepository<Guest>
{
    Task<IReadOnlyList<Guest>> GetBySponsorAsync(uint sponsorMemberId, CancellationToken ct = default);
    Task<Guest?> GetActiveGuestForSponsorAsync(uint sponsorMemberId, CancellationToken ct = default);
}
