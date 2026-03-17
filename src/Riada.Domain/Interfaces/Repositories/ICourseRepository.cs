using Riada.Domain.Entities.CourseScheduling;

namespace Riada.Domain.Interfaces.Repositories;

public interface ICourseRepository : IGenericRepository<Course>
{
    Task<Course?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<IReadOnlyList<Course>> GetAllAsync(CancellationToken ct = default);
}
