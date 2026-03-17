using FluentAssertions;
using Moq;
using Riada.Application.UseCases.Courses;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;
using Xunit;

namespace Riada.UnitTests.UseCases.Courses;

public class CancelBookingUseCaseTests
{
    private readonly Mock<IBookingRepository> _bookingRepositoryMock = new();
    private readonly Mock<IClassSessionRepository> _sessionRepositoryMock = new();

    private CancelBookingUseCase CreateSut()
        => new(_bookingRepositoryMock.Object, _sessionRepositoryMock.Object);

    [Fact]
    public async Task ExecuteAsync_ShouldCancelBooking_WhenBookingIsConfirmed()
    {
        // Arrange
        const uint memberId = 3;
        const uint sessionId = 22;
        var booking = new Booking
        {
            MemberId = memberId,
            SessionId = sessionId,
            Status = BookingStatus.Confirmed,
            BookedAt = DateTime.UtcNow.AddMinutes(-30)
        };
        var sessionSnapshot = BuildSession(sessionId, enrolledCount: 4, maxCapacity: 12);

        _bookingRepositoryMock.Setup(r => r.GetByCompositeKeyAsync(memberId, sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _bookingRepositoryMock.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _sessionRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sessionSnapshot);

        var sut = CreateSut();

        // Act
        var result = await sut.ExecuteAsync(memberId, sessionId);

        // Assert
        result.Action.Should().Be("cancelled");
        result.BookingStatus.Should().Be(BookingStatus.Cancelled.ToString());
        result.Message.Should().Be("Booking cancelled successfully.");
        result.EnrolledCount.Should().Be(4);
        result.MaxCapacity.Should().Be(12);

        booking.Status.Should().Be(BookingStatus.Cancelled);
        _bookingRepositoryMock.Verify(r => r.UpdateBooking(booking), Times.Once);
        _bookingRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldBeIdempotent_WhenBookingIsAlreadyCancelled()
    {
        // Arrange
        const uint memberId = 8;
        const uint sessionId = 44;
        var booking = new Booking
        {
            MemberId = memberId,
            SessionId = sessionId,
            Status = BookingStatus.Cancelled,
            BookedAt = DateTime.UtcNow.AddHours(-1)
        };
        var sessionSnapshot = BuildSession(sessionId, enrolledCount: 6, maxCapacity: 20);

        _bookingRepositoryMock.Setup(r => r.GetByCompositeKeyAsync(memberId, sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _sessionRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sessionSnapshot);

        var sut = CreateSut();

        // Act
        var result = await sut.ExecuteAsync(memberId, sessionId);

        // Assert
        result.Action.Should().Be("already_cancelled");
        result.BookingStatus.Should().Be(BookingStatus.Cancelled.ToString());
        result.Message.Should().Be("Booking is already cancelled.");

        _bookingRepositoryMock.Verify(r => r.UpdateBooking(It.IsAny<Booking>()), Times.Never);
        _bookingRepositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldThrowNotFound_WhenBookingDoesNotExist()
    {
        // Arrange
        const uint memberId = 99;
        const uint sessionId = 777;

        _bookingRepositoryMock.Setup(r => r.GetByCompositeKeyAsync(memberId, sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        var sut = CreateSut();

        // Act
        var action = () => sut.ExecuteAsync(memberId, sessionId);

        // Assert
        await action.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.Code == "NOT_FOUND");
    }

    private static ClassSession BuildSession(uint id, ushort enrolledCount, ushort maxCapacity)
        => new()
        {
            Id = id,
            EnrolledCount = enrolledCount,
            Course = new Course { Id = 1, CourseName = "Yoga", MaxCapacity = maxCapacity }
        };
}
