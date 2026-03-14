using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Courses;

public class CancelBookingUseCase
{
    private readonly IBookingRepository _bookingRepository;

    public CancelBookingUseCase(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task ExecuteAsync(
        uint memberId,
        uint sessionId,
        CancellationToken ct = default)
    {
        var booking = await _bookingRepository.GetByCompositeKeyAsync(memberId, sessionId, ct)
            ?? throw new NotFoundException("Booking", $"{memberId}-{sessionId}");

        booking.Status = BookingStatus.Cancelled;

        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync(ct);
    }
}
