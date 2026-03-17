namespace Riada.Application.DTOs.Responses.Courses;

public record CancelBookingResponse(
    string Message,
    string BookingStatus,
    string Action,
    uint MemberId,
    uint SessionId,
    ushort EnrolledCount,
    ushort MaxCapacity,
    decimal OccupancyPercent);
