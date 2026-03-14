using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class EquipmentRepository : GenericRepository<Equipment>, IEquipmentRepository
{
    public EquipmentRepository(RiadaDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Equipment>> GetByClubIdAsync(uint clubId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(e => e.ClubId == clubId)
            .OrderBy(e => e.Name)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Equipment>> GetByStatusAsync(EquipmentStatus status, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(e => e.Status == status)
            .OrderBy(e => e.Name)
            .ToListAsync(ct);

    public async Task<Equipment?> GetWithMaintenanceTicketsAsync(uint equipmentId, CancellationToken ct = default)
        => await DbSet
            .Include(e => e.MaintenanceTickets)
                .ThenInclude(mt => mt.Technician)
            .Include(e => e.Club)
            .FirstOrDefaultAsync(e => e.Id == equipmentId, ct);

    public async Task<IReadOnlyList<Equipment>> GetRequiringMaintenanceAsync(CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Include(e => e.MaintenanceTickets)
            .Where(e => e.MaintenanceTickets.Any(mt => 
                mt.Status == MaintenanceTicketStatus.Reported || 
                mt.Status == MaintenanceTicketStatus.InProgress))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Equipment>> GetFilteredAsync(
        uint? clubId,
        string? status,
        CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking().AsQueryable();

        if (clubId.HasValue)
            query = query.Where(e => e.ClubId == clubId.Value);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<EquipmentStatus>(status, true, out var equipmentStatus))
            query = query.Where(e => e.Status == equipmentStatus);

        return await query.OrderBy(e => e.Name).ToListAsync(ct);
    }
}
