namespace Riada.Application.DTOs.Requests.Employees;

public record UpdateEmployeeRequest(
    string? LastName,
    string? FirstName,
    string? Email,
    string? Role,
    uint? ClubId,
    decimal? MonthlySalary,
    string? Qualifications);
