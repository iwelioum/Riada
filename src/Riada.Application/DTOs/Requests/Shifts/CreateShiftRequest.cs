namespace Riada.Application.DTOs.Requests.Shifts;

public record CreateShiftRequest(
    uint EmployeeId,
    uint ClubId,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string ShiftType);
