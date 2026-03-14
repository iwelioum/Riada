using Riada.Domain.Enums;

namespace Riada.Domain.Entities.ClubManagement;

public class MaintenanceTicket
{
    public uint Id { get; set; }
    public uint EquipmentId { get; set; }
    public uint? TechnicianId { get; set; }
    public MaintenanceType MaintenanceType { get; set; }
    public MaintenanceTicketStatus Status { get; set; } = MaintenanceTicketStatus.Reported;
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.Medium;
    public DateTime ReportedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ProblemDescription { get; set; }
    public decimal RepairCost { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Equipment Equipment { get; set; } = null!;
    public Employee? Technician { get; set; }
}
