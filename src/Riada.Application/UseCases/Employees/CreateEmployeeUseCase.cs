using Riada.Application.DTOs.Requests.Employees;
using Riada.Application.DTOs.Responses.Employees;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Employees;

public class CreateEmployeeUseCase
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateEmployeeUseCase(IEmployeeRepository employeeRepository, IUnitOfWork unitOfWork)
    {
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<EmployeeDetailResponse> ExecuteAsync(CreateEmployeeRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.LastName))
            throw new DomainException("VALIDATION", "Last name is required.");

        if (string.IsNullOrWhiteSpace(request.FirstName))
            throw new DomainException("VALIDATION", "First name is required.");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new DomainException("VALIDATION", "Email is required.");

        if (!Enum.TryParse<EmployeeRole>(request.Role, ignoreCase: true, out var role))
            throw new DomainException("VALIDATION", $"Invalid role '{request.Role}'. Valid values: {string.Join(", ", Enum.GetNames<EmployeeRole>())}.");

        var existing = await _employeeRepository.GetByEmailAsync(request.Email.Trim(), ct);
        if (existing is not null)
            throw new DomainException("CONFLICT", "An employee with this email already exists.");

        var employee = new Employee
        {
            LastName = request.LastName.Trim(),
            FirstName = request.FirstName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Role = role,
            ClubId = request.ClubId,
            MonthlySalary = request.MonthlySalary,
            Qualifications = request.Qualifications?.Trim(),
            HiredOn = request.HiredOn,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _employeeRepository.AddAsync(employee, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        // Reload with Club navigation
        var created = await _employeeRepository.GetByIdWithClubAsync(employee.Id, ct)
            ?? throw new DomainException("INTERNAL", "Employee was saved but could not be retrieved.");

        return new EmployeeDetailResponse(
            created.Id, created.LastName, created.FirstName, created.Email,
            created.Role.ToString(), created.ClubId, created.Club.Name,
            created.MonthlySalary, created.Qualifications, created.HiredOn, created.CreatedAt);
    }
}
