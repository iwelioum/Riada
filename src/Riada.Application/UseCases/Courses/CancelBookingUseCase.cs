using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;
using Riada.Application.DTOs.Responses.Courses;

namespace Riada.Application.UseCases.Courses;

public class CancelBookingUseCase
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IClassSessionRepository _sessionRepository;

    public CancelBookingUseCase(
        IBookingRepository bookingRepository,
        IClassSessionRepository sessionRepository)
    {
        _bookingRepository = bookingRepository;
        _sessionRepository = sessionRepository;
    }

    public async Task<CancelBookingResponse> ExecuteAsync(
        uint memberId,
        uint sessionId,
        CancellationToken ct = default)
    {
        var booking = await _bookingRepository.GetByCompositeKeyAsync(memberId, sessionId, ct)
            ?? throw new NotFoundException("Booking", $"{memberId}-{sessionId}");

        string action;
        string message;

        if (booking.Status == BookingStatus.Cancelled)
        {
            action = "already_cancelled";
            message = "Booking is already cancelled.";
        }
        else
        {
            booking.Status = BookingStatus.Cancelled;
            _bookingRepository.UpdateBooking(booking);
            await _bookingRepository.SaveChangesAsync(ct);
            action = "cancelled";
            message = "Booking cancelled successfully.";
        }

        var capacity = await GetCapacitySnapshotAsync(sessionId, ct);

        return new CancelBookingResponse(
            Message: message,
            BookingStatus: booking.Status.ToString(),
            Action: action,
            MemberId: memberId,
            SessionId: sessionId,
            EnrolledCount: capacity.EnrolledCount,
            MaxCapacity: capacity.MaxCapacity,
            OccupancyPercent: capacity.OccupancyPercent);
    }

    private async Task<(ushort EnrolledCount, ushort MaxCapacity, decimal OccupancyPercent)> GetCapacitySnapshotAsync(
        uint sessionId,
        CancellationToken ct)
    {
        var session = await _sessionRepository.GetByIdWithDetailsAsync(sessionId, ct)
            ?? throw new NotFoundException("ClassSession", sessionId);

        var occupancy = session.Course.MaxCapacity > 0
            ? Math.Round(100m * session.EnrolledCount / session.Course.MaxCapacity, 2)
            : 0m;

        return (session.EnrolledCount, session.Course.MaxCapacity, occupancy);
    }
}
