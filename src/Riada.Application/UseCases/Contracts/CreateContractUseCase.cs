using FluentValidation;
using Riada.Application.DTOs.Requests.Contracts;
using Riada.Application.DTOs.Responses.Contracts;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Contracts;

public class CreateContractUseCase
{
    private readonly IContractRepository _contractRepository;
    private readonly IMemberRepository _memberRepository;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly IValidator<CreateContractRequest> _validator;

    public CreateContractUseCase(
        IContractRepository contractRepository,
        IMemberRepository memberRepository,
        ISubscriptionPlanRepository planRepository,
        IValidator<CreateContractRequest> validator)
    {
        _contractRepository = contractRepository;
        _memberRepository = memberRepository;
        _planRepository = planRepository;
        _validator = validator;
    }

    public async Task<ContractResponse> ExecuteAsync(
        CreateContractRequest request,
        CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var member = await _memberRepository.GetByIdAsync(request.MemberId, ct)
            ?? throw new NotFoundException("Member", request.MemberId);

        var plan = await _planRepository.GetByIdAsync(request.PlanId, ct)
            ?? throw new NotFoundException("SubscriptionPlan", request.PlanId);

        var contract = new Contract
        {
            MemberId = request.MemberId,
            PlanId = request.PlanId,
            HomeClubId = request.HomeClubId,
            StartDate = request.StartDate,
            Status = ContractStatus.Active
        };

        await _contractRepository.AddAsync(contract, ct);
        await _contractRepository.SaveChangesAsync(ct);

        // Reload contract with relationships to build response
        var reloadedContract = await _contractRepository.GetByIdAsync(contract.Id, ct);

        return new ContractResponse(
            reloadedContract!.Id,
            reloadedContract.Plan?.PlanName ?? "Unknown",
            reloadedContract.HomeClub?.Name ?? "Unknown",
            reloadedContract.StartDate,
            reloadedContract.EndDate,
            reloadedContract.ContractType.ToString(),
            reloadedContract.Status.ToString(),
            reloadedContract.FreezeStartDate,
            reloadedContract.FreezeEndDate,
            reloadedContract.ContractOptions?.Select(co => co.Option?.OptionName ?? "Unknown").ToList() ?? []);
    }
}
