using Riada.Application.DTOs.Responses.Common;
using Riada.Application.DTOs.Responses.Members;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Members;

public class ListMembersUseCase
{
    private const int MaxPageSize = 100;
    private const int MaxSearchLength = 100;
    private readonly IMemberRepository _memberRepository;

    public ListMembersUseCase(IMemberRepository memberRepository)
        => _memberRepository = memberRepository;

    public async Task<PagedResponse<MemberSummaryResponse>> ExecuteAsync(
        int page, int pageSize,
        MemberStatus? statusFilter = null,
        string? searchTerm = null,
        CancellationToken ct = default)
    {
        if (page < 1)
            throw new ArgumentOutOfRangeException(nameof(page), "Page must be greater than or equal to 1.");

        if (pageSize < 1 || pageSize > MaxPageSize)
            throw new ArgumentOutOfRangeException(nameof(pageSize), $"Page size must be between 1 and {MaxPageSize}.");

        var normalizedSearch = string.IsNullOrWhiteSpace(searchTerm) ? null : searchTerm.Trim();
        if (normalizedSearch is not null && normalizedSearch.Length > MaxSearchLength)
            throw new ArgumentException($"Search term cannot exceed {MaxSearchLength} characters.", nameof(searchTerm));

        var (items, totalCount) = await _memberRepository.GetPagedAsync(
            page, pageSize, statusFilter, normalizedSearch, ct);

        var dtos = items.Select(m => new MemberSummaryResponse(
            m.Id, m.LastName, m.FirstName, m.Email,
            m.Status.ToString(), null, null,
            m.LastVisitDate, m.TotalVisits)).ToList();

        return new PagedResponse<MemberSummaryResponse>(dtos, totalCount, page, pageSize);
    }
}
