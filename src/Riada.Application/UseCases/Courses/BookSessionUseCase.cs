using FluentValidation;
using Riada.Application.DTOs.Requests.Courses;
using Riada.Application.DTOs.Responses.Courses;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Courses;

public class BookSessionUseCase
{
    private readonly IValidator<BookSessionRequest> _validator;
    private readonly IClassSessionRepository _sessionRepository;
    private readonly IMemberRepository _memberRepository;
    private readonly IBookingRepository _bookingRepository;

    public BookSessionUseCase(
        IValidator<BookSessionRequest> validator,
        IClassSessionRepository sessionRepository,
        IMemberRepository memberRepository,
        IBookingRepository bookingRepository)
    {
        _validator = validator;
        _sessionRepository = sessionRepository;
        _memberRepository = memberRepository;
        _bookingRepository = bookingRepository;
    }

    public async Task<BookingResponse> ExecuteAsync(BookSessionRequest request, CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        var session = await _sessionRepository.GetWithBookingsAsync(request.SessionId, ct)
            ?? throw new NotFoundException("ClassSession", request.SessionId);

        var member = await _memberRepository.GetByIdAsync(request.MemberId, ct)
            ?? throw new NotFoundException("Member", request.MemberId);

        if (member.Status != MemberStatus.Active)
            throw new BusinessRuleException("MEMBER_NOT_ACTIVE", "Member account is not active.");

        var bookingStatus = ResolveStatus(session);
        var now = DateTime.UtcNow;
        var existingBooking = await _bookingRepository.GetByCompositeKeyAsync(request.MemberId, request.SessionId, ct);

        Booking booking;
        string action;
        string message;

        if (existingBooking is null)
        {
            booking = new Booking
            {
                MemberId = request.MemberId,
                SessionId = request.SessionId,
                BookedAt = now,
                Status = bookingStatus
            };

            await _bookingRepository.AddAsync(booking, ct);
            await _bookingRepository.SaveChangesAsync(ct);
            action = "created";
            message = bookingStatus == BookingStatus.Confirmed
                ? "Booking confirmed."
                : "Added to waitlist — session is at full capacity.";
        }
        else if (existingBooking.Status == BookingStatus.Cancelled)
        {
            existingBooking.Status = bookingStatus;
            existingBooking.BookedAt = now;

            _bookingRepository.UpdateBooking(existingBooking);
            await _bookingRepository.SaveChangesAsync(ct);
            booking = existingBooking;
            action = "rebooked";
            message = bookingStatus == BookingStatus.Confirmed
                ? "Booking reactivated and confirmed."
                : "Booking reactivated and moved to waitlist.";
        }
        else
        {
            booking = existingBooking;
            bookingStatus = existingBooking.Status;
            action = bookingStatus == BookingStatus.Confirmed ? "already_confirmed" : "already_waitlisted";
            message = bookingStatus == BookingStatus.Confirmed
                ? "Member is already booked on this session."
                : "Member is already waitlisted for this session.";
        }

        var capacity = await GetCapacitySnapshotAsync(request.SessionId, session, ct);

        return new BookingResponse(
            Message: message,
            BookingStatus: bookingStatus.ToString(),
            Action: action,
            MemberId: booking.MemberId,
            SessionId: booking.SessionId,
            BookedAt: booking.BookedAt,
            EnrolledCount: capacity.EnrolledCount,
            MaxCapacity: capacity.MaxCapacity,
            OccupancyPercent: capacity.OccupancyPercent);
    }

    private static BookingStatus ResolveStatus(ClassSession session)
        => session.EnrolledCount < session.Course.MaxCapacity
            ? BookingStatus.Confirmed
            : BookingStatus.Waitlisted;

    private async Task<(ushort EnrolledCount, ushort MaxCapacity, decimal OccupancyPercent)> GetCapacitySnapshotAsync(
        uint sessionId,
        ClassSession fallbackSession,
        CancellationToken ct)
    {
        var refreshedSession = await _sessionRepository.GetByIdWithDetailsAsync(sessionId, ct) ?? fallbackSession;
        var maxCapacity = refreshedSession.Course.MaxCapacity;
        var occupancy = maxCapacity > 0
            ? Math.Round(100m * refreshedSession.EnrolledCount / maxCapacity, 2)
            : 0m;

        return (refreshedSession.EnrolledCount, maxCapacity, occupancy);
    }
}
