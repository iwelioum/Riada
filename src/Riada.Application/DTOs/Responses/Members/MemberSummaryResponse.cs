namespace Riada.Application.DTOs.Responses.Members;

public record MemberSummaryResponse(
    uint Id,
    string LastName,
    string FirstName,
    string Email,
    string Status,
    string? CurrentPlan,
    string? HomeClub,
    DateOnly? LastVisitDate,
    uint TotalVisits);
