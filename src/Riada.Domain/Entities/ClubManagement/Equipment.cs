using Riada.Domain.Enums;

namespace Riada.Domain.Entities.ClubManagement;

public class Equipment
{
    public uint Id { get; set; }
    public string Name { get; set; } = null!;
    public string EquipmentType { get; set; } = null!;
    public uint ClubId { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int AcquisitionYear { get; set; }
    public EquipmentStatus Status { get; set; } = EquipmentStatus.InService;
    public decimal? PurchaseCost { get; set; }
    public uint UsageHours { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Club Club { get; set; } = null!;
    public ICollection<MaintenanceTicket> MaintenanceTickets { get; set; } = [];
}
