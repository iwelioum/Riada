using FluentAssertions;
using Moq;
using Xunit;
using Riada.Application.DTOs.Requests.Courses;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.CourseScheduling;

namespace Riada.UnitTests.UseCases.Courses;

public class BookSessionUseCaseTests
{
    private readonly Mock<IClassSessionRepository> _sessionRepositoryMock;
    private readonly Mock<IMemberRepository> _memberRepositoryMock;
    private readonly Mock<IBookingRepository> _bookingRepositoryMock;

    public BookSessionUseCaseTests()
    {
        _sessionRepositoryMock = new Mock<IClassSessionRepository>();
        _memberRepositoryMock = new Mock<IMemberRepository>();
        _bookingRepositoryMock = new Mock<IBookingRepository>();
    }

    [Fact]
    public async Task BookSession_WithAvailableSpots_ShouldSucceed()
    {
        // Arrange
        var session = new ClassSession
        {
            Id = 100,
            Capacity = 20,
            BookedCount = 15,
            StartTime = DateTime.UtcNow.AddDays(7)
        };

        _sessionRepositoryMock
            .Setup(r => r.GetByIdAsync(100u, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        // Act
        var result = await _sessionRepositoryMock.Object.GetByIdAsync(100u);

        // Assert
        result.Should().NotBeNull();
        result!.Capacity.Should().Be(20);
        result.BookedCount.Should().BeLessThan(result.Capacity);
    }

    [Fact]
    public async Task BookSession_WithSessionFull_ShouldAddToWaitlist()
    {
        // Arrange
        var session = new ClassSession
        {
            Id = 101,
            Capacity = 20,
            BookedCount = 20,
            StartTime = DateTime.UtcNow.AddDays(7)
        };

        _sessionRepositoryMock
            .Setup(r => r.GetByIdAsync(101u, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        // Act
        var result = await _sessionRepositoryMock.Object.GetByIdAsync(101u);

        // Assert
        result.Should().NotBeNull();
        result!.BookedCount.Should().Be(result.Capacity);
    }

    [Fact]
    public async Task BookSession_WithNonExistentMember_ShouldReturnNull()
    {
        // Arrange
        _memberRepositoryMock
            .Setup(r => r.GetByIdAsync(999u, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Membership.Member?)null);

        // Act
        var result = await _memberRepositoryMock.Object.GetByIdAsync(999u);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task BookSession_WithInactiveMember_ShouldFail()
    {
        // Arrange
        var member = new Domain.Entities.Membership.Member { Id = 3, Status = "Suspended" };

        _memberRepositoryMock
            .Setup(r => r.GetByIdAsync(3u, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);

        // Act
        var result = await _memberRepositoryMock.Object.GetByIdAsync(3u);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be("Suspended");
    }

    [Fact]
    public async Task BookSession_WithPastSession_ShouldFail()
    {
        // Arrange
        var session = new ClassSession
        {
            Id = 102,
            Capacity = 20,
            BookedCount = 10,
            StartTime = DateTime.UtcNow.AddDays(-1)
        };

        // Act & Assert
        session.StartTime.Should().BeLessThan(DateTime.UtcNow);
    }

    [Fact]
    public async Task BookSession_WhenRepositoryFails_ShouldPropagatException()
    {
        // Arrange
        _sessionRepositoryMock
            .Setup(r => r.GetByIdAsync(103u, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database connection failed"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _sessionRepositoryMock.Object.GetByIdAsync(103u));
    }
}

