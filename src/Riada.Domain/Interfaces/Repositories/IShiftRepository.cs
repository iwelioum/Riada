using Riada.Domain.Entities.ClubManagement;

namespace Riada.Domain.Interfaces.Repositories;

public interface IShiftRepository
{
    Task<IReadOnlyList<Shift>> GetWeekAsync(uint clubId, DateOnly weekStart, CancellationToken ct = default);
    Task<Shift> CreateAsync(Shift shift, CancellationToken ct = default);
    Task<bool> DeleteAsync(uint id, CancellationToken ct = default);
}
