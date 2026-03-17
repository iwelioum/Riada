using Riada.Application.DTOs.Requests.Employees;
using Riada.Application.DTOs.Responses.Employees;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Employees;

public class UpdateEmployeeUseCase
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateEmployeeUseCase(IEmployeeRepository employeeRepository, IUnitOfWork unitOfWork)
    {
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<EmployeeDetailResponse> ExecuteAsync(uint id, UpdateEmployeeRequest request, CancellationToken ct = default)
    {
        var employee = await _employeeRepository.GetByIdWithClubAsync(id, ct)
            ?? throw new NotFoundException("Employee", id);

        if (!string.IsNullOrWhiteSpace(request.LastName))
            employee.LastName = request.LastName.Trim();

        if (!string.IsNullOrWhiteSpace(request.FirstName))
            employee.FirstName = request.FirstName.Trim();

        if (!string.IsNullOrWhiteSpace(request.Email))
            employee.Email = request.Email.Trim().ToLowerInvariant();

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            if (!Enum.TryParse<EmployeeRole>(request.Role, ignoreCase: true, out var role))
                throw new DomainException("VALIDATION", $"Invalid role '{request.Role}'.");
            employee.Role = role;
        }

        if (request.ClubId.HasValue)
            employee.ClubId = request.ClubId.Value;

        if (request.MonthlySalary.HasValue)
            employee.MonthlySalary = request.MonthlySalary.Value;

        if (request.Qualifications is not null)
            employee.Qualifications = request.Qualifications.Trim();

        employee.UpdatedAt = DateTime.UtcNow;

        _employeeRepository.Update(employee);
        await _unitOfWork.SaveChangesAsync(ct);

        return new EmployeeDetailResponse(
            employee.Id, employee.LastName, employee.FirstName, employee.Email,
            employee.Role.ToString(), employee.ClubId, employee.Club.Name,
            employee.MonthlySalary, employee.Qualifications, employee.HiredOn, employee.CreatedAt);
    }
}
