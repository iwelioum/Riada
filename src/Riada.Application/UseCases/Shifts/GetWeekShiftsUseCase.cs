using Riada.Application.DTOs.Responses.Shifts;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Shifts;

public class GetWeekShiftsUseCase
{
    private readonly IShiftRepository _shiftRepository;

    public GetWeekShiftsUseCase(IShiftRepository shiftRepository)
        => _shiftRepository = shiftRepository;

    public async Task<IReadOnlyList<ShiftResponse>> ExecuteAsync(uint clubId, DateOnly weekStart, CancellationToken ct = default)
    {
        var shifts = await _shiftRepository.GetWeekAsync(clubId, weekStart, ct);

        return shifts.Select(s => new ShiftResponse(
            s.Id,
            s.EmployeeId,
            $"{s.Employee.FirstName} {s.Employee.LastName}",
            s.Employee.Role.ToString(),
            s.ClubId,
            s.Date.ToString("yyyy-MM-dd"),
            s.StartTime.ToString("HH:mm"),
            s.EndTime.ToString("HH:mm"),
            s.ShiftType.ToString()
        )).ToList();
    }
}
