using FluentValidation;
using Riada.Application.DTOs.Requests.Courses;
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

    public async Task<string> ExecuteAsync(BookSessionRequest request, CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        var session = await _sessionRepository.GetWithBookingsAsync(request.SessionId, ct)
            ?? throw new NotFoundException("ClassSession", request.SessionId);

        var member = await _memberRepository.GetByIdAsync(request.MemberId, ct)
            ?? throw new NotFoundException("Member", request.MemberId);

        if (member.Status != MemberStatus.Active)
            throw new BusinessRuleException("MEMBER_NOT_ACTIVE", "Member account is not active.");

        var status = session.EnrolledCount < session.Course.MaxCapacity
            ? BookingStatus.Confirmed
            : BookingStatus.Waitlisted;

        var booking = new Booking
        {
            MemberId = request.MemberId,
            SessionId = request.SessionId,
            BookedAt = DateTime.UtcNow,
            Status = status
        };

        await _bookingRepository.AddAsync(booking, ct);
        await _bookingRepository.SaveChangesAsync(ct);

        return status == BookingStatus.Confirmed
            ? "Booking confirmed"
            : "Added to waitlist — session is at full capacity";
    }
}
