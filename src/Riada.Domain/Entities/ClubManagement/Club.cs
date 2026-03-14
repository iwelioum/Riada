using Riada.Domain.Enums;

namespace Riada.Domain.Entities.ClubManagement;

public class Club
{
    public uint Id { get; set; }
    public string Name { get; set; } = null!;
    public string AddressStreet { get; set; } = null!;
    public string AddressCity { get; set; } = null!;
    public string AddressPostalCode { get; set; } = null!;
    public string Country { get; set; } = "Belgium";
    public bool IsOpen247 { get; set; } = true;
    public DateOnly OpenedOn { get; set; }
    public ClubOperationalStatus OperationalStatus { get; set; } = ClubOperationalStatus.Open;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<Employee> Employees { get; set; } = [];
    public ICollection<Equipment> Equipment { get; set; } = [];
}
