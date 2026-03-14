using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;

namespace Riada.Domain.Interfaces.Repositories;

public interface IEquipmentRepository : IGenericRepository<Equipment>
{
    Task<IReadOnlyList<Equipment>> GetByClubIdAsync(uint clubId, CancellationToken ct = default);
    Task<IReadOnlyList<Equipment>> GetByStatusAsync(EquipmentStatus status, CancellationToken ct = default);
    Task<Equipment?> GetWithMaintenanceTicketsAsync(uint equipmentId, CancellationToken ct = default);
    Task<IReadOnlyList<Equipment>> GetRequiringMaintenanceAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Equipment>> GetFilteredAsync(uint? clubId, string? status, CancellationToken ct = default);
}
