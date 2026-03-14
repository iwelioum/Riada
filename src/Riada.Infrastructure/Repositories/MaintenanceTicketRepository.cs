using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class MaintenanceTicketRepository : GenericRepository<MaintenanceTicket>, IMaintenanceTicketRepository
{
    public MaintenanceTicketRepository(RiadaDbContext context) : base(context) { }

    public async Task<IReadOnlyList<MaintenanceTicket>> GetByEquipmentIdAsync(uint equipmentId, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(mt => mt.EquipmentId == equipmentId)
            .OrderByDescending(mt => mt.ReportedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<MaintenanceTicket>> GetByStatusAsync(MaintenanceTicketStatus status, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(mt => mt.Status == status)
            .Include(mt => mt.Equipment)
            .OrderByDescending(mt => mt.ReportedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<MaintenanceTicket>> GetByPriorityAsync(MaintenancePriority priority, CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(mt => mt.Priority == priority)
            .Include(mt => mt.Equipment)
            .OrderByDescending(mt => mt.ReportedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<MaintenanceTicket>> GetPendingAsync(CancellationToken ct = default)
        => await DbSet.AsNoTracking()
            .Where(mt => mt.Status == MaintenanceTicketStatus.Reported || mt.Status == MaintenanceTicketStatus.InProgress)
            .Include(mt => mt.Equipment)
            .OrderBy(mt => mt.Priority)
            .ThenByDescending(mt => mt.ReportedAt)
            .ToListAsync(ct);

    public async Task<MaintenanceTicket?> GetWithEquipmentAndTechnicianAsync(uint ticketId, CancellationToken ct = default)
        => await DbSet
            .Include(mt => mt.Equipment)
                .ThenInclude(e => e.Club)
            .Include(mt => mt.Technician)
            .FirstOrDefaultAsync(mt => mt.Id == ticketId, ct);
}
