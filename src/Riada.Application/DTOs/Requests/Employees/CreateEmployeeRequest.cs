namespace Riada.Application.DTOs.Requests.Employees;

public record CreateEmployeeRequest(
    string LastName,
    string FirstName,
    string Email,
    string Role,
    uint ClubId,
    decimal? MonthlySalary,
    string? Qualifications,
    DateOnly HiredOn);
