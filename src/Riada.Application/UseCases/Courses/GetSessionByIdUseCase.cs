using Riada.Application.DTOs.Responses.Courses;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Courses;

public class GetSessionByIdUseCase
{
    private readonly IClassSessionRepository _sessionRepository;

    public GetSessionByIdUseCase(IClassSessionRepository sessionRepository)
        => _sessionRepository = sessionRepository;

    public async Task<SessionResponse?> ExecuteAsync(uint sessionId, CancellationToken ct = default)
    {
        var s = await _sessionRepository.GetByIdWithDetailsAsync(sessionId, ct);
        if (s is null) return null;

        return new SessionResponse(
            s.Id,
            s.CourseId,
            s.Course.CourseName,
            s.Course.ActivityType?.ToString(),
            $"{s.Instructor.FirstName} {s.Instructor.LastName}",
            s.Club.Name,
            s.StartsAt,
            s.DurationMinutes,
            s.EnrolledCount,
            s.Course.MaxCapacity,
            s.Course.MaxCapacity > 0
                ? Math.Round(100m * s.EnrolledCount / s.Course.MaxCapacity, 2)
                : 0m);
    }
}
