namespace Riada.Application.DTOs.Responses.Courses;

public record BookingResponse(
    uint MemberId,
    uint SessionId,
    string Status,
    DateTime BookedAt);

