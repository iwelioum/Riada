using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class ContractRepository : GenericRepository<Contract>, IContractRepository
{
    public ContractRepository(RiadaDbContext context) : base(context) { }

    public async Task<Contract?> GetLatestActiveAsync(uint memberId, CancellationToken ct = default)
        => await DbSet
            .Include(c => c.Plan)
            .Include(c => c.HomeClub)
            .Where(c => c.MemberId == memberId && c.Status == ContractStatus.Active)
            .OrderByDescending(c => c.StartDate)
            .FirstOrDefaultAsync(ct);

    public async Task<Contract?> GetWithOptionsAsync(uint contractId, CancellationToken ct = default)
        => await DbSet
            .Include(c => c.Plan)
            .Include(c => c.HomeClub)
            .Include(c => c.ContractOptions)
                .ThenInclude(co => co.Option)
            .FirstOrDefaultAsync(c => c.Id == contractId, ct);

    public async Task<IReadOnlyList<Contract>> GetByMemberIdAsync(uint memberId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Include(c => c.Plan)
            .Where(c => c.MemberId == memberId)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(ct);
}
