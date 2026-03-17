namespace Riada.Application.DTOs.Responses.Shifts;

public record ShiftResponse(
    uint Id,
    uint EmployeeId,
    string EmployeeName,
    string EmployeeRole,
    uint ClubId,
    string Date,
    string StartTime,
    string EndTime,
    string ShiftType);
