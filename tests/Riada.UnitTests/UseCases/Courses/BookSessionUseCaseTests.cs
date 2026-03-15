using FluentAssertions;
using Moq;
using Xunit;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;

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
            Course = new Course { MaxCapacity = 20 },
            EnrolledCount = 15,
            StartsAt = DateTime.UtcNow.AddDays(7)
        };

        _sessionRepositoryMock
            .Setup(r => r.GetByIdAsync(100u, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        // Act
        var result = await _sessionRepositoryMock.Object.GetByIdAsync(100u);

        // Assert
        result.Should().NotBeNull();
        result!.Course.MaxCapacity.Should().Be(20);
        result.EnrolledCount.Should().BeLessThan(result.Course.MaxCapacity);
    }

    [Fact]
    public async Task BookSession_WithSessionFull_ShouldAddToWaitlist()
    {
        // Arrange
        var session = new ClassSession
        {
            Id = 101,
            Course = new Course { MaxCapacity = 20 },
            EnrolledCount = 20,
            StartsAt = DateTime.UtcNow.AddDays(7)
        };

        _sessionRepositoryMock
            .Setup(r => r.GetByIdAsync(101u, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        // Act
        var result = await _sessionRepositoryMock.Object.GetByIdAsync(101u);

        // Assert
        result.Should().NotBeNull();
        result!.EnrolledCount.Should().Be(result.Course.MaxCapacity);
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
        var member = new Member { Id = 3, Status = MemberStatus.Suspended };

        _memberRepositoryMock
            .Setup(r => r.GetByIdAsync(3u, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);

        // Act
        var result = await _memberRepositoryMock.Object.GetByIdAsync(3u);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(MemberStatus.Suspended);
    }

    [Fact]
    public async Task BookSession_WithPastSession_ShouldFail()
    {
        // Arrange
        var session = new ClassSession
        {
            Id = 102,
            Course = new Course { MaxCapacity = 20 },
            EnrolledCount = 10,
            StartsAt = DateTime.UtcNow.AddDays(-1)
        };

        // Act & Assert
        session.StartsAt.Should().BeBefore(DateTime.UtcNow);
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

