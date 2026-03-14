using Riada.Domain.Enums;

namespace Riada.Domain.Entities.ClubManagement;

public class Employee
{
    public uint Id { get; set; }
    public string LastName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public uint ClubId { get; set; }
    public EmployeeRole Role { get; set; }
    public decimal? MonthlySalary { get; set; }
    public string? Qualifications { get; set; }
    public DateOnly HiredOn { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Club Club { get; set; } = null!;
}
