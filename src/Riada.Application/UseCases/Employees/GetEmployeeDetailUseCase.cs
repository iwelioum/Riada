using Riada.Application.DTOs.Responses.Employees;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Employees;

public class GetEmployeeDetailUseCase
{
    private readonly IEmployeeRepository _employeeRepository;

    public GetEmployeeDetailUseCase(IEmployeeRepository employeeRepository)
        => _employeeRepository = employeeRepository;

    public async Task<EmployeeDetailResponse> ExecuteAsync(uint id, CancellationToken ct = default)
    {
        var employee = await _employeeRepository.GetByIdWithClubAsync(id, ct)
            ?? throw new NotFoundException("Employee", id);

        return new EmployeeDetailResponse(
            employee.Id,
            employee.LastName,
            employee.FirstName,
            employee.Email,
            employee.Role.ToString(),
            employee.ClubId,
            employee.Club.Name,
            employee.MonthlySalary,
            employee.Qualifications,
            employee.HiredOn,
            employee.CreatedAt);
    }
}
