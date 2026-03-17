namespace Riada.Application.DTOs.Responses.Courses;

public record BookingResponse(
    string Message,
    string BookingStatus,
    string Action,
    uint MemberId,
    uint SessionId,
    DateTime BookedAt,
    ushort EnrolledCount,
    ushort MaxCapacity,
    decimal OccupancyPercent);

