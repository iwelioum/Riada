using Riada.Application.DTOs.Requests.Access;
using Riada.Application.DTOs.Responses.Access;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Access;

public class CheckMemberAccessUseCase
{
    private readonly IAccessCheckService _accessCheckService;

    public CheckMemberAccessUseCase(IAccessCheckService accessCheckService)
        => _accessCheckService = accessCheckService;

    public async Task<AccessCheckResponse> ExecuteAsync(CheckMemberAccessRequest request, CancellationToken ct = default)
    {
        var decision = await _accessCheckService.CheckMemberAccessAsync(request.MemberId, request.ClubId, ct);

        return new AccessCheckResponse(
            Decision: decision == AccessDecision.Granted ? "granted" : "denied");
    }
}
