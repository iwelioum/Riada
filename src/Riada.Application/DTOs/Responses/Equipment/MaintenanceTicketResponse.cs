namespace Riada.Application.DTOs.Responses.Equipment;

public record MaintenanceTicketResponse(
    uint Id,
    uint EquipmentId,
    string Priority,
    string Description,
    string Status,
    DateTime CreatedAt,
    DateTime? ResolvedAt);

