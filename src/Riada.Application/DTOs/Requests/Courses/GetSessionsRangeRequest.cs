namespace Riada.Application.DTOs.Requests.Courses;

public record GetSessionsRangeRequest(
    uint ClubId,
    DateTime From,
    DateTime To);
