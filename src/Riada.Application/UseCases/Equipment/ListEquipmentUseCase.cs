using Riada.Application.DTOs.Requests.Equipment;
using Riada.Application.DTOs.Responses.Equipment;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Equipment;

public class ListEquipmentUseCase
{
    private readonly IEquipmentRepository _equipmentRepository;

    public ListEquipmentUseCase(IEquipmentRepository equipmentRepository)
        => _equipmentRepository = equipmentRepository;

    public async Task<IReadOnlyList<EquipmentResponse>> ExecuteAsync(
        ListEquipmentRequest request,
        CancellationToken ct = default)
    {
        var equipment = await _equipmentRepository.GetFilteredAsync(
            request.ClubId,
            request.Status,
            ct);

        return equipment.Select(e => new EquipmentResponse(
            e.Id,
            e.Name,
            e.EquipmentType,
            e.Status.ToString(),
            e.ClubId,
            e.AcquisitionYear)).ToList().AsReadOnly();
    }
}
