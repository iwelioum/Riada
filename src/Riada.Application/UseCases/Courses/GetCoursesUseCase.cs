using Riada.Application.DTOs.Responses.Courses;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Courses;

public class GetCoursesUseCase
{
    private readonly ICourseRepository _courseRepository;

    public GetCoursesUseCase(ICourseRepository courseRepository)
        => _courseRepository = courseRepository;

    public async Task<IReadOnlyList<CourseResponse>> ExecuteAsync(CancellationToken ct = default)
    {
        var courses = await _courseRepository.GetAllAsync(ct);

        return courses.Select(c => new CourseResponse(
            c.Id,
            c.CourseName,
            c.Description,
            c.DifficultyLevel.ToString(),
            c.DurationMinutes,
            c.MaxCapacity,
            c.EstimatedCalories,
            c.ActivityType?.ToString()
        )).ToList();
    }
}
