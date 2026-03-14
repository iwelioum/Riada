using Riada.Application.DTOs.Responses.Courses;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Courses;

public class GetUpcomingSessionsUseCase
{
    private readonly IClassSessionRepository _sessionRepository;

    public GetUpcomingSessionsUseCase(IClassSessionRepository sessionRepository)
        => _sessionRepository = sessionRepository;

    public async Task<IReadOnlyList<SessionResponse>> ExecuteAsync(uint clubId, int days = 14, CancellationToken ct = default)
    {
        var sessions = await _sessionRepository.GetUpcomingByClubAsync(clubId, days, ct);

        return sessions.Select(s => new SessionResponse(
            s.Id,
            s.Course.CourseName,
            $"{s.Instructor.FirstName} {s.Instructor.LastName}",
            s.Club.Name,
            s.StartsAt,
            s.DurationMinutes,
            s.EnrolledCount,
            s.Course.MaxCapacity,
            s.Course.MaxCapacity > 0
                ? Math.Round(100m * s.EnrolledCount / s.Course.MaxCapacity, 2)
                : 0m
        )).ToList();
    }
}
