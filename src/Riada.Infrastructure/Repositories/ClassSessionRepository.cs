using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class ClassSessionRepository : GenericRepository<ClassSession>, IClassSessionRepository
{
    public ClassSessionRepository(RiadaDbContext context) : base(context) { }

    public async Task<IReadOnlyList<ClassSession>> GetUpcomingByClubAsync(uint clubId, int days = 14, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var until = now.AddDays(days);

        return await DbSet.AsNoTracking()
            .Include(s => s.Course)
            .Include(s => s.Instructor)
            .Include(s => s.Club)
            .Where(s => s.ClubId == clubId && s.StartsAt >= now && s.StartsAt <= until)
            .OrderBy(s => s.StartsAt)
            .ToListAsync(ct);
    }

    public async Task<ClassSession?> GetWithBookingsAsync(uint sessionId, CancellationToken ct = default)
        => await DbSet
            .Include(s => s.Course)
            .Include(s => s.Bookings)
            .FirstOrDefaultAsync(s => s.Id == sessionId, ct);
}
