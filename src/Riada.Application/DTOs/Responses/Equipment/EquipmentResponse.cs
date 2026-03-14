namespace Riada.Application.DTOs.Responses.Equipment;

public record EquipmentResponse(
    uint Id,
    string Name,
    string EquipmentType,
    string Status,
    uint ClubId,
    int AcquisitionYear);

