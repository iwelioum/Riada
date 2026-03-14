using Riada.Application.DTOs.Requests.Access;
using Riada.Application.DTOs.Responses.Access;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Access;

public class CheckGuestAccessUseCase
{
    private readonly IAccessCheckService _accessCheckService;

    public CheckGuestAccessUseCase(IAccessCheckService accessCheckService)
        => _accessCheckService = accessCheckService;

    public async Task<AccessCheckResponse> ExecuteAsync(CheckGuestAccessRequest request, CancellationToken ct = default)
    {
        var decision = await _accessCheckService.CheckGuestAccessAsync(
            request.GuestId, request.CompanionMemberId, request.ClubId, ct);

        return new AccessCheckResponse(
            Decision: decision == AccessDecision.Granted ? "granted" : "denied");
    }
}
