using Riada.Application.DTOs.Requests.Members;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Members;

public class AnonymizeMemberUseCase
{
    private readonly IGdprService _gdprService;

    public AnonymizeMemberUseCase(IGdprService gdprService) => _gdprService = gdprService;

    public async Task<string> ExecuteAsync(AnonymizeMemberRequest request, CancellationToken ct = default)
        => await _gdprService.AnonymizeMemberAsync(request.MemberId, request.RequestedBy, ct);
}
