using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;

namespace Riada.Domain.Interfaces.Repositories;

public interface IMaintenanceTicketRepository : IGenericRepository<MaintenanceTicket>
{
    Task<IReadOnlyList<MaintenanceTicket>> GetByEquipmentIdAsync(uint equipmentId, CancellationToken ct = default);
    Task<IReadOnlyList<MaintenanceTicket>> GetByStatusAsync(MaintenanceTicketStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<MaintenanceTicket>> GetByPriorityAsync(MaintenancePriority priority, CancellationToken ct = default);
    Task<IReadOnlyList<MaintenanceTicket>> GetPendingAsync(CancellationToken ct = default);
    Task<MaintenanceTicket?> GetWithEquipmentAndTechnicianAsync(uint ticketId, CancellationToken ct = default);
}
