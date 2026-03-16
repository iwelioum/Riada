using Riada.Application.DTOs.Requests.Equipment;
using Riada.Application.DTOs.Responses.Equipment;
using Riada.Domain.Enums;
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
        var normalizedStatus = string.IsNullOrWhiteSpace(request.Status)
            ? null
            : request.Status.Trim();

        if (normalizedStatus is not null)
        {
            if (normalizedStatus.Length > 30)
                throw new ArgumentException("Status filter cannot exceed 30 characters.", nameof(request));

            if (!Enum.TryParse<EquipmentStatus>(normalizedStatus, true, out _))
                throw new ArgumentException("Status filter is invalid.", nameof(request));
        }

        var equipment = await _equipmentRepository.GetFilteredAsync(
            request.ClubId,
            normalizedStatus,
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
