namespace Riada.Application.DTOs.Responses.Courses;

public record SessionResponse(
    uint Id,
    uint CourseId,
    string CourseName,
    string? ActivityType,
    string InstructorName,
    string ClubName,
    DateTime StartsAt,
    ushort DurationMinutes,
    ushort EnrolledCount,
    ushort MaxCapacity,
    decimal OccupancyPercent);
