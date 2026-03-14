using Riada.Application.DTOs.Responses.Contracts;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Contracts;

public class GetContractDetailUseCase
{
    private readonly IContractRepository _contractRepository;

    public GetContractDetailUseCase(IContractRepository contractRepository)
        => _contractRepository = contractRepository;

    public async Task<ContractResponse> ExecuteAsync(uint contractId, CancellationToken ct = default)
    {
        var contract = await _contractRepository.GetWithOptionsAsync(contractId, ct)
            ?? throw new NotFoundException("Contract", contractId);

        return new ContractResponse(
            contract.Id,
            contract.Plan?.PlanName ?? "Unknown",
            contract.HomeClub?.Name ?? "Unknown",
            contract.StartDate,
            contract.EndDate,
            contract.ContractType.ToString(),
            contract.Status.ToString(),
            contract.FreezeStartDate,
            contract.FreezeEndDate,
            contract.ContractOptions?.Select(co => co.Option?.OptionName ?? "Unknown").ToList() ?? []);
    }
}
