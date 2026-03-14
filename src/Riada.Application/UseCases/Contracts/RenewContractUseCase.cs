using Riada.Application.DTOs.Requests.Contracts;
using Riada.Application.DTOs.Responses.Contracts;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Contracts;

public class RenewContractUseCase
{
    private readonly IContractLifecycleService _contractService;

    public RenewContractUseCase(IContractLifecycleService contractService)
        => _contractService = contractService;

    public async Task<ContractLifecycleResponse> ExecuteAsync(RenewContractRequest request, CancellationToken ct = default)
    {
        var result = await _contractService.RenewContractAsync(request.ContractId, ct);
        var success = result.StartsWith("OK:");
        return new ContractLifecycleResponse(success, result);
    }
}
