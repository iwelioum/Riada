namespace Riada.Application.DTOs.Responses.Courses;

public record SessionResponse(
    uint Id,
    string CourseName,
    string InstructorName,
    string ClubName,
    DateTime StartsAt,
    ushort DurationMinutes,
    ushort EnrolledCount,
    ushort MaxCapacity,
    decimal OccupancyPercent);
