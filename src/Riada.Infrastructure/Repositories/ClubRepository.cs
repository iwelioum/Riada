using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class ClubRepository : GenericRepository<Club>, IClubRepository
{
    public ClubRepository(RiadaDbContext context) : base(context) { }

    public async Task<Club?> GetWithEquipmentAsync(uint clubId, CancellationToken ct = default)
        => await DbSet
            .Include(c => c.Equipment)
            .Include(c => c.Employees)
            .FirstOrDefaultAsync(c => c.Id == clubId, ct);
}
