using Riada.Application.DTOs.Requests.Shifts;
using Riada.Application.DTOs.Responses.Shifts;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Shifts;

public class CreateShiftUseCase
{
    private readonly IShiftRepository _shiftRepository;

    public CreateShiftUseCase(IShiftRepository shiftRepository)
        => _shiftRepository = shiftRepository;

    public async Task<ShiftResponse> ExecuteAsync(CreateShiftRequest request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<ShiftType>(request.ShiftType, true, out var shiftType))
            throw new ArgumentException($"Invalid shift type: {request.ShiftType}");

        var shift = new Shift
        {
            EmployeeId = request.EmployeeId,
            ClubId = request.ClubId,
            Date = request.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            ShiftType = shiftType
        };

        var created = await _shiftRepository.CreateAsync(shift, ct);

        return new ShiftResponse(
            created.Id,
            created.EmployeeId,
            $"{created.Employee.FirstName} {created.Employee.LastName}",
            created.Employee.Role.ToString(),
            created.ClubId,
            created.Date.ToString("yyyy-MM-dd"),
            created.StartTime.ToString("HH:mm"),
            created.EndTime.ToString("HH:mm"),
            created.ShiftType.ToString()
        );
    }
}
