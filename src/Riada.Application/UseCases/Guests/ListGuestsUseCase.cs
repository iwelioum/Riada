using Riada.Application.DTOs.Responses.Common;
using Riada.Application.DTOs.Responses.Guests;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Guests;

public class ListGuestsUseCase
{
    private readonly IGuestRepository _guestRepository;

    public ListGuestsUseCase(IGuestRepository guestRepository)
        => _guestRepository = guestRepository;

    public async Task<PagedResponse<GuestResponse>> ExecuteAsync(
        int page = 1, int pageSize = 50, CancellationToken ct = default)
    {
        var (guests, totalCount) = await _guestRepository.GetPagedAsync(page, pageSize, ct);

        var dtos = guests.Select(g => new GuestResponse(
            g.Id, g.LastName, g.FirstName, g.DateOfBirth,
            g.Status.ToString(), g.SponsorMemberId,
            g.SponsorMember is not null
                ? $"{g.SponsorMember.FirstName} {g.SponsorMember.LastName}"
                : null
        )).ToList();

        return new PagedResponse<GuestResponse>(dtos, totalCount, page, pageSize);
    }
}
