using Riada.Application.DTOs.Responses.Guests;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Guests;

public class ListGuestsUseCase
{
    private readonly IGuestRepository _guestRepository;

    public ListGuestsUseCase(IGuestRepository guestRepository)
        => _guestRepository = guestRepository;

    public async Task<IReadOnlyList<GuestResponse>> ExecuteAsync(CancellationToken ct = default)
    {
        var guests = await _guestRepository.GetAllAsync(ct);

        return guests.Select(g => new GuestResponse(
            g.Id, g.LastName, g.FirstName, g.DateOfBirth,
            g.Status.ToString(), g.SponsorMemberId,
            g.SponsorMember is not null
                ? $"{g.SponsorMember.FirstName} {g.SponsorMember.LastName}"
                : null
        )).ToList();
    }
}
