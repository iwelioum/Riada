namespace Riada.Application.DTOs.Requests.Equipment;

public record CreateMaintenanceTicketRequest(uint EquipmentId, string Priority, string Description);
