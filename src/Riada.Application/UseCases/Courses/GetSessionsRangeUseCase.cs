using FluentValidation;
using Riada.Application.DTOs.Requests.Courses;
using Riada.Application.DTOs.Responses.Courses;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Courses;

public class GetSessionsRangeUseCase
{
    private readonly IValidator<GetSessionsRangeRequest> _validator;
    private readonly IClassSessionRepository _sessionRepository;

    public GetSessionsRangeUseCase(
        IValidator<GetSessionsRangeRequest> validator,
        IClassSessionRepository sessionRepository)
    {
        _validator = validator;
        _sessionRepository = sessionRepository;
    }

    public async Task<IReadOnlyList<SessionResponse>> ExecuteAsync(
        GetSessionsRangeRequest request,
        CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var sessions = await _sessionRepository.GetByClubAndRangeAsync(
            request.ClubId,
            request.From,
            request.To,
            ct);

        return sessions.Select(s => new SessionResponse(
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
                : 0m
        )).ToList();
    }
}
