using Riada.Application.DTOs.Responses.Common;
using Riada.Application.DTOs.Responses.Members;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Members;

public class ListMembersUseCase
{
    private readonly IMemberRepository _memberRepository;

    public ListMembersUseCase(IMemberRepository memberRepository)
        => _memberRepository = memberRepository;

    public async Task<PagedResponse<MemberSummaryResponse>> ExecuteAsync(
        int page, int pageSize,
        MemberStatus? statusFilter = null,
        string? searchTerm = null,
        CancellationToken ct = default)
    {
        var (items, totalCount) = await _memberRepository.GetPagedAsync(
            page, pageSize, statusFilter, searchTerm, ct);

        var dtos = items.Select(m => new MemberSummaryResponse(
            m.Id, m.LastName, m.FirstName, m.Email,
            m.Status.ToString(), null, null,
            m.LastVisitDate, m.TotalVisits)).ToList();

        return new PagedResponse<MemberSummaryResponse>(dtos, totalCount, page, pageSize);
    }
}
