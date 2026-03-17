using Riada.Domain.Enums;

namespace Riada.Domain.Entities.ClubManagement;

public class Shift
{
    public uint Id { get; set; }
    public uint EmployeeId { get; set; }
    public uint ClubId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ShiftType ShiftType { get; set; } = ShiftType.Custom;
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Employee Employee { get; set; } = null!;
    public Club Club { get; set; } = null!;
}
