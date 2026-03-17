using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class CourseRepository : GenericRepository<Course>, ICourseRepository
{
    public CourseRepository(RiadaDbContext context) : base(context) { }

    public async Task<Course?> GetByNameAsync(string name, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(c => c.CourseName == name, ct);

    public async Task<IReadOnlyList<Course>> GetAllAsync(CancellationToken ct = default)
        => await DbSet.AsNoTracking().OrderBy(c => c.CourseName).ToListAsync(ct);
}
