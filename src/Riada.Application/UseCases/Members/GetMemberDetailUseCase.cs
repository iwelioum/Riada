using Riada.Application.DTOs.Responses.Contracts;
using Riada.Application.DTOs.Responses.Members;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Members;

public class GetMemberDetailUseCase
{
    private readonly IMemberRepository _memberRepository;

    public GetMemberDetailUseCase(IMemberRepository memberRepository)
        => _memberRepository = memberRepository;

    public async Task<MemberDetailResponse> ExecuteAsync(uint memberId, CancellationToken ct = default)
    {
        var member = await _memberRepository.GetWithContractsAsync(memberId, ct)
            ?? throw new NotFoundException("Member", memberId);

        var contracts = member.Contracts
            .OrderByDescending(c => c.StartDate)
            .Select(c => new ContractResponse(
                c.Id,
                c.Plan.PlanName,
                c.HomeClub.Name,
                c.StartDate,
                c.EndDate,
                c.ContractType.ToString(),
                c.Status.ToString(),
                c.FreezeStartDate,
                c.FreezeEndDate,
                c.ContractOptions
                    .Where(co => co.RemovedOn == null)
                    .Select(co => co.Option.OptionName)
                    .ToList()))
            .ToList();

        return new MemberDetailResponse(
            member.Id,
            member.LastName,
            member.FirstName,
            member.Email,
            member.Gender.ToString(),
            member.DateOfBirth,
            member.Nationality,
            member.MobilePhone,
            member.Status.ToString(),
            member.PrimaryGoal?.ToString(),
            member.LastVisitDate,
            member.TotalVisits,
            member.GdprConsentAt,
            member.MarketingConsent,
            contracts);
    }
}
