using FluentValidation;
using Riada.Application.DTOs.Requests.Guests;
using Riada.Application.DTOs.Responses.Guests;
using Riada.Domain.Entities.AccessControl;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Guests;

public class RegisterGuestUseCase
{
    private readonly IValidator<RegisterGuestRequest> _validator;
    private readonly IGuestRepository _guestRepository;

    public RegisterGuestUseCase(IValidator<RegisterGuestRequest> validator, IGuestRepository guestRepository)
    {
        _validator = validator;
        _guestRepository = guestRepository;
    }

    public async Task<GuestResponse> ExecuteAsync(RegisterGuestRequest request, CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var guest = new Guest
        {
            SponsorMemberId = request.SponsorMemberId,
            LastName = request.LastName,
            FirstName = request.FirstName,
            DateOfBirth = request.DateOfBirth,
            Email = request.Email,
            Status = GuestStatus.Active
        };

        // Triggers in MySQL enforce: age >= 16, max 1 active per sponsor, sponsor has duo pass
        await _guestRepository.AddAsync(guest, ct);
        await _guestRepository.SaveChangesAsync(ct);

        return new GuestResponse(
            guest.Id, guest.LastName, guest.FirstName,
            guest.DateOfBirth, guest.Status.ToString(),
            guest.SponsorMemberId, null, guest.Email);
    }
}
