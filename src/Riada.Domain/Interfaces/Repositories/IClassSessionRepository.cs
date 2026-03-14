using Riada.Domain.Entities.CourseScheduling;

namespace Riada.Domain.Interfaces.Repositories;

public interface IClassSessionRepository : IGenericRepository<ClassSession>
{
    Task<IReadOnlyList<ClassSession>> GetUpcomingByClubAsync(uint clubId, int days = 14, CancellationToken ct = default);
    Task<ClassSession?> GetWithBookingsAsync(uint sessionId, CancellationToken ct = default);
}
