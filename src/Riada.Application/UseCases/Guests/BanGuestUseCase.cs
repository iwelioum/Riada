using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Guests;

public class BanGuestUseCase
{
    private readonly IGuestRepository _guestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public BanGuestUseCase(IGuestRepository guestRepository, IUnitOfWork unitOfWork)
    {
        _guestRepository = guestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(uint guestId, CancellationToken ct = default)
    {
        var guest = await _guestRepository.GetByIdAsync(guestId, ct)
            ?? throw new NotFoundException("Guest", guestId);

        guest.Status = GuestStatus.Banned;

        _guestRepository.Update(guest);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
