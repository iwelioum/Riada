using Riada.Application.DTOs.Requests.Contracts;
using Riada.Application.DTOs.Responses.Contracts;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Contracts;

public class FreezeContractUseCase
{
    private readonly IContractLifecycleService _contractService;

    public FreezeContractUseCase(IContractLifecycleService contractService)
        => _contractService = contractService;

    public async Task<ContractLifecycleResponse> ExecuteAsync(FreezeContractRequest request, CancellationToken ct = default)
    {
        var result = await _contractService.FreezeContractAsync(request.ContractId, request.DurationDays, ct);
        var success = result.StartsWith("OK:");
        return new ContractLifecycleResponse(success, result);
    }
}
