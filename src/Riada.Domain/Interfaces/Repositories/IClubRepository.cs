using Riada.Domain.Entities.ClubManagement;

namespace Riada.Domain.Interfaces.Repositories;

public interface IClubRepository : IGenericRepository<Club>
{
    Task<Club?> GetWithEquipmentAsync(uint clubId, CancellationToken ct = default);
}
