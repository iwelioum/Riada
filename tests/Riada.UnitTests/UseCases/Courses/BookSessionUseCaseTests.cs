using FluentAssertions;
using FluentValidation;
using Moq;
using Riada.Application.DTOs.Requests.Courses;
using Riada.Application.UseCases.Courses;
using Riada.Application.Validators;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;
using Xunit;

namespace Riada.UnitTests.UseCases.Courses;

public class BookSessionUseCaseTests
{
    private readonly Mock<IClassSessionRepository> _sessionRepositoryMock = new();
    private readonly Mock<IMemberRepository> _memberRepositoryMock = new();
    private readonly Mock<IBookingRepository> _bookingRepositoryMock = new();
    private readonly IValidator<BookSessionRequest> _validator = new BookSessionValidator();

    private BookSessionUseCase CreateSut()
        => new(
            _validator,
            _sessionRepositoryMock.Object,
            _memberRepositoryMock.Object,
            _bookingRepositoryMock.Object);

    [Fact]
    public async Task ExecuteAsync_ShouldCreateConfirmedBooking_WhenCapacityAvailable()
    {
        // Arrange
        var request = new BookSessionRequest(MemberId: 7, SessionId: 101);
        var initialSession = BuildSession(request.SessionId, enrolledCount: 3, maxCapacity: 8);
        var refreshedSession = BuildSession(request.SessionId, enrolledCount: 4, maxCapacity: 8);
        var member = new Member { Id = request.MemberId, Status = MemberStatus.Active };
        Booking? persistedBooking = null;

        _sessionRepositoryMock.Setup(r => r.GetWithBookingsAsync(request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(initialSession);
        _sessionRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(refreshedSession);
        _memberRepositoryMock.Setup(r => r.GetByIdAsync(request.MemberId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);
        _bookingRepositoryMock.Setup(r => r.GetByCompositeKeyAsync(request.MemberId, request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);
        _bookingRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Booking>(), It.IsAny<CancellationToken>()))
            .Callback<Booking, CancellationToken>((booking, _) => persistedBooking = booking)
            .ReturnsAsync((Booking booking, CancellationToken _) => booking);
        _bookingRepositoryMock.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var sut = CreateSut();

        // Act
        var result = await sut.ExecuteAsync(request);

        // Assert
        result.Action.Should().Be("created");
        result.BookingStatus.Should().Be(BookingStatus.Confirmed.ToString());
        result.Message.Should().Be("Booking confirmed.");
        result.EnrolledCount.Should().Be(4);
        result.MaxCapacity.Should().Be(8);
        result.OccupancyPercent.Should().Be(50m);

        persistedBooking.Should().NotBeNull();
        persistedBooking!.Status.Should().Be(BookingStatus.Confirmed);
        persistedBooking.MemberId.Should().Be(request.MemberId);
        persistedBooking.SessionId.Should().Be(request.SessionId);

        _bookingRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Booking>(), It.IsAny<CancellationToken>()), Times.Once);
        _bookingRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _bookingRepositoryMock.Verify(r => r.UpdateBooking(It.IsAny<Booking>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldReturnIdempotentResult_WhenBookingAlreadyConfirmed()
    {
        // Arrange
        var request = new BookSessionRequest(MemberId: 9, SessionId: 202);
        var initialSession = BuildSession(request.SessionId, enrolledCount: 5, maxCapacity: 10);
        var refreshedSession = BuildSession(request.SessionId, enrolledCount: 5, maxCapacity: 10);
        var member = new Member { Id = request.MemberId, Status = MemberStatus.Active };
        var existingBooking = new Booking
        {
            MemberId = request.MemberId,
            SessionId = request.SessionId,
            Status = BookingStatus.Confirmed,
            BookedAt = DateTime.UtcNow.AddMinutes(-10)
        };

        _sessionRepositoryMock.Setup(r => r.GetWithBookingsAsync(request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(initialSession);
        _sessionRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(refreshedSession);
        _memberRepositoryMock.Setup(r => r.GetByIdAsync(request.MemberId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);
        _bookingRepositoryMock.Setup(r => r.GetByCompositeKeyAsync(request.MemberId, request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingBooking);

        var sut = CreateSut();

        // Act
        var result = await sut.ExecuteAsync(request);

        // Assert
        result.Action.Should().Be("already_confirmed");
        result.BookingStatus.Should().Be(BookingStatus.Confirmed.ToString());
        result.Message.Should().Be("Member is already booked on this session.");

        _bookingRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Booking>(), It.IsAny<CancellationToken>()), Times.Never);
        _bookingRepositoryMock.Verify(r => r.UpdateBooking(It.IsAny<Booking>()), Times.Never);
        _bookingRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldRebookCancelledBooking_WhenExistingBookingCancelled()
    {
        // Arrange
        var request = new BookSessionRequest(MemberId: 11, SessionId: 303);
        var initialSession = BuildSession(request.SessionId, enrolledCount: 1, maxCapacity: 4);
        var refreshedSession = BuildSession(request.SessionId, enrolledCount: 2, maxCapacity: 4);
        var member = new Member { Id = request.MemberId, Status = MemberStatus.Active };
        var originalBookedAt = DateTime.UtcNow.AddDays(-1);
        var existingBooking = new Booking
        {
            MemberId = request.MemberId,
            SessionId = request.SessionId,
            Status = BookingStatus.Cancelled,
            BookedAt = originalBookedAt
        };

        _sessionRepositoryMock.Setup(r => r.GetWithBookingsAsync(request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(initialSession);
        _sessionRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(refreshedSession);
        _memberRepositoryMock.Setup(r => r.GetByIdAsync(request.MemberId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);
        _bookingRepositoryMock.Setup(r => r.GetByCompositeKeyAsync(request.MemberId, request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingBooking);
        _bookingRepositoryMock.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var sut = CreateSut();

        // Act
        var result = await sut.ExecuteAsync(request);

        // Assert
        result.Action.Should().Be("rebooked");
        result.BookingStatus.Should().Be(BookingStatus.Confirmed.ToString());
        result.Message.Should().Be("Booking reactivated and confirmed.");
        result.EnrolledCount.Should().Be(2);
        existingBooking.Status.Should().Be(BookingStatus.Confirmed);
        existingBooking.BookedAt.Should().BeAfter(originalBookedAt);

        _bookingRepositoryMock.Verify(r => r.UpdateBooking(existingBooking), Times.Once);
        _bookingRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _bookingRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Booking>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldThrow_WhenMemberIsNotActive()
    {
        // Arrange
        var request = new BookSessionRequest(MemberId: 5, SessionId: 404);
        var session = BuildSession(request.SessionId, enrolledCount: 2, maxCapacity: 10);
        var member = new Member { Id = request.MemberId, Status = MemberStatus.Suspended };

        _sessionRepositoryMock.Setup(r => r.GetWithBookingsAsync(request.SessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);
        _memberRepositoryMock.Setup(r => r.GetByIdAsync(request.MemberId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);

        var sut = CreateSut();

        // Act
        var action = () => sut.ExecuteAsync(request);

        // Assert
        await action.Should().ThrowAsync<BusinessRuleException>()
            .Where(ex => ex.Code == "MEMBER_NOT_ACTIVE");
    }

    private static ClassSession BuildSession(uint id, ushort enrolledCount, ushort maxCapacity)
        => new()
        {
            Id = id,
            EnrolledCount = enrolledCount,
            Course = new Course { Id = 1, CourseName = "Body Pump", MaxCapacity = maxCapacity },
            Bookings = []
        };
}
