namespace Riada.Application.DTOs.Requests.Courses;

public record CancelBookingRequest(
    uint MemberId,
    uint SessionId);
