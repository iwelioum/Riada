namespace Riada.Application.DTOs.Responses.Employees;

public record EmployeeSummaryResponse(
    uint Id,
    string LastName,
    string FirstName,
    string Email,
    string Role,
    uint ClubId,
    string ClubName,
    DateOnly HiredOn);
