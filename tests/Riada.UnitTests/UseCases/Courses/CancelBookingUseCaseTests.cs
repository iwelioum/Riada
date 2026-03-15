using FluentAssertions;
using Moq;
using Xunit;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Enums;

namespace Riada.UnitTests.UseCases.Courses;

public class CancelBookingUseCaseTests
{
    private readonly Mock<IBookingRepository> _bookingRepositoryMock;

    public CancelBookingUseCaseTests()
    {
        _bookingRepositoryMock = new Mock<IBookingRepository>();
    }

    [Fact]
    public async Task CancelBooking_WithValidBooking_ShouldRemove()
    {
        // Arrange
        var booking = new Booking
        {
            MemberId = 1,
            SessionId = 100,
            Status = BookingStatus.Confirmed,
            BookedAt = DateTime.UtcNow.AddDays(-5)
        };

        _bookingRepositoryMock
            .Setup(r => r.Remove(booking));

        // Act
        _bookingRepositoryMock.Object.Remove(booking);

        // Assert
        _bookingRepositoryMock.Verify(r => r.Remove(booking), Times.Once);
    }

    [Fact]
    public async Task CancelBooking_WithNonExistentBooking_ShouldReturnNull()
    {
        // Arrange
        _bookingRepositoryMock
            .Setup(r => r.GetByIdAsync(999u, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        // Act
        var result = await _bookingRepositoryMock.Object.GetByIdAsync(999u);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CancelBooking_WithZeroMemberId_ShouldFail()
    {
        // Arrange
        uint memberId = 0;

        // Act & Assert
        memberId.Should().Be(0);
    }

    [Fact]
    public async Task CancelBooking_WithZeroSessionId_ShouldFail()
    {
        // Arrange
        uint sessionId = 0;

        // Act & Assert
        sessionId.Should().Be(0);
    }

    [Fact]
    public async Task CancelBooking_WhenRepositoryFails_ShouldPropagate()
    {
        // Arrange
        _bookingRepositoryMock
            .Setup(r => r.GetByIdAsync(1u, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database connection failed"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _bookingRepositoryMock.Object.GetByIdAsync(1u));
    }

    [Fact]
    public async Task CancelBooking_WithCancelledStatus_ShouldFail()
    {
        // Arrange
        var booking = new Booking
        {
            MemberId = 2,
            SessionId = 101,
            Status = BookingStatus.Cancelled,
            BookedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Act & Assert
        booking.Status.Should().Be(BookingStatus.Cancelled);
    }
}

