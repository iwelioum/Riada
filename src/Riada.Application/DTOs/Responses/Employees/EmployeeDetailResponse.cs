namespace Riada.Application.DTOs.Responses.Employees;

public record EmployeeDetailResponse(
    uint Id,
    string LastName,
    string FirstName,
    string Email,
    string Role,
    uint ClubId,
    string ClubName,
    decimal? MonthlySalary,
    string? Qualifications,
    DateOnly HiredOn,
    DateTime CreatedAt);
