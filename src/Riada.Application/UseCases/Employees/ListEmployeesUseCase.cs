using Riada.Application.DTOs.Responses.Common;
using Riada.Application.DTOs.Responses.Employees;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Employees;

public class ListEmployeesUseCase
{
    private const int MaxPageSize = 100;
    private const int MaxSearchLength = 100;
    private readonly IEmployeeRepository _employeeRepository;

    public ListEmployeesUseCase(IEmployeeRepository employeeRepository)
        => _employeeRepository = employeeRepository;

    public async Task<PagedResponse<EmployeeSummaryResponse>> ExecuteAsync(
        int page, int pageSize,
        uint? clubId = null,
        string? searchTerm = null,
        CancellationToken ct = default)
    {
        if (page < 1)
            throw new ArgumentOutOfRangeException(nameof(page), "Page must be >= 1.");

        if (pageSize < 1 || pageSize > MaxPageSize)
            throw new ArgumentOutOfRangeException(nameof(pageSize), $"Page size must be between 1 and {MaxPageSize}.");

        var normalizedSearch = string.IsNullOrWhiteSpace(searchTerm) ? null : searchTerm.Trim();
        if (normalizedSearch is not null && normalizedSearch.Length > MaxSearchLength)
            throw new ArgumentException($"Search term cannot exceed {MaxSearchLength} characters.", nameof(searchTerm));

        var (items, totalCount) = await _employeeRepository.GetPagedAsync(page, pageSize, clubId, normalizedSearch, ct);

        var dtos = items.Select(e => new EmployeeSummaryResponse(
            e.Id, e.LastName, e.FirstName, e.Email,
            e.Role.ToString(), e.ClubId, e.Club.Name,
            e.HiredOn)).ToList();

        return new PagedResponse<EmployeeSummaryResponse>(dtos, totalCount, page, pageSize);
    }
}
