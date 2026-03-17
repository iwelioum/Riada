using FluentAssertions;
using FluentValidation;
using Moq;
using Riada.Application.DTOs.Requests.Courses;
using Riada.Application.UseCases.Courses;
using Riada.Application.Validators;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Interfaces.Repositories;
using Xunit;

namespace Riada.UnitTests.UseCases.Courses;

public class GetSessionsRangeUseCaseTests
{
    private readonly Mock<IClassSessionRepository> _sessionRepositoryMock = new();
    private readonly IValidator<GetSessionsRangeRequest> _validator = new GetSessionsRangeValidator();

    private GetSessionsRangeUseCase CreateSut()
        => new(_validator, _sessionRepositoryMock.Object);

    [Fact]
    public async Task ExecuteAsync_ShouldReturnMappedSessions_WhenRangeIsValid()
    {
        // Arrange
        var from = DateTime.UtcNow.Date.AddDays(1);
        var to = from.AddDays(3);
        var request = new GetSessionsRangeRequest(ClubId: 5, From: from, To: to);

        var sessions = new List<ClassSession>
        {
            BuildSession(id: 10, clubId: request.ClubId, startsAt: from.AddHours(8), enrolledCount: 4, maxCapacity: 12, courseName: "HIIT"),
            BuildSession(id: 11, clubId: request.ClubId, startsAt: from.AddHours(10), enrolledCount: 12, maxCapacity: 12, courseName: "Pilates")
        };

        _sessionRepositoryMock.Setup(r => r.GetByClubAndRangeAsync(
                request.ClubId,
                request.From,
                request.To,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(sessions);

        var sut = CreateSut();

        // Act
        var result = await sut.ExecuteAsync(request);

        // Assert
        result.Should().HaveCount(2);
        result[0].CourseName.Should().Be("HIIT");
        result[0].InstructorName.Should().Be("Alex Doe");
        result[0].ClubName.Should().Be("Brussels Club");
        result[0].OccupancyPercent.Should().Be(33.33m);

        result[1].CourseName.Should().Be("Pilates");
        result[1].OccupancyPercent.Should().Be(100m);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldThrowValidationException_WhenFromIsAfterTo()
    {
        // Arrange
        var from = DateTime.UtcNow.Date.AddDays(3);
        var to = DateTime.UtcNow.Date.AddDays(2);
        var request = new GetSessionsRangeRequest(ClubId: 3, From: from, To: to);
        var sut = CreateSut();

        // Act
        var action = () => sut.ExecuteAsync(request);

        // Assert
        await action.Should().ThrowAsync<ValidationException>();
        _sessionRepositoryMock.Verify(r => r.GetByClubAndRangeAsync(
            It.IsAny<uint>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldThrowValidationException_WhenRangeExceedsLimit()
    {
        // Arrange
        var from = DateTime.UtcNow.Date.AddDays(1);
        var to = from.AddDays(61);
        var request = new GetSessionsRangeRequest(ClubId: 3, From: from, To: to);
        var sut = CreateSut();

        // Act
        var action = () => sut.ExecuteAsync(request);

        // Assert
        await action.Should().ThrowAsync<ValidationException>();
        _sessionRepositoryMock.Verify(r => r.GetByClubAndRangeAsync(
            It.IsAny<uint>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    private static ClassSession BuildSession(
        uint id,
        uint clubId,
        DateTime startsAt,
        ushort enrolledCount,
        ushort maxCapacity,
        string courseName)
        => new()
        {
            Id = id,
            ClubId = clubId,
            StartsAt = startsAt,
            DurationMinutes = 45,
            EnrolledCount = enrolledCount,
            Course = new Course
            {
                Id = id + 100,
                CourseName = courseName,
                MaxCapacity = maxCapacity
            },
            Instructor = new Employee
            {
                Id = 7,
                FirstName = "Alex",
                LastName = "Doe",
                Email = "alex.doe@example.com",
                ClubId = clubId
            },
            Club = new Club
            {
                Id = clubId,
                Name = "Brussels Club",
                AddressStreet = "Main street",
                AddressCity = "Brussels",
                AddressPostalCode = "1000"
            }
        };
}
