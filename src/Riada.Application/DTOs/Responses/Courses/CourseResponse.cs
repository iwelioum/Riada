namespace Riada.Application.DTOs.Responses.Courses;

public record CourseResponse(
    uint Id,
    string CourseName,
    string? Description,
    string DifficultyLevel,
    ushort DurationMinutes,
    ushort MaxCapacity,
    uint? EstimatedCalories,
    string? ActivityType);
