using Riada.Domain.Entities.ClubManagement;

namespace Riada.Domain.Interfaces.Repositories;

public interface IEmployeeRepository : IGenericRepository<Employee>
{
    Task<Employee?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Employee?> GetByIdWithClubAsync(uint id, CancellationToken ct = default);
    Task<(IReadOnlyList<Employee> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        uint? clubId = null,
        string? searchTerm = null,
        CancellationToken ct = default);
    Task<IReadOnlyList<Employee>> GetByClubIdAsync(uint clubId, CancellationToken ct = default);
}
