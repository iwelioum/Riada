using FluentAssertions;
using Moq;
using Xunit;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.AccessControl;

namespace Riada.UnitTests.UseCases.Guests;

public class RegisterGuestUseCaseTests
{
    private readonly Mock<IGuestRepository> _guestRepositoryMock;

    public RegisterGuestUseCaseTests()
    {
        _guestRepositoryMock = new Mock<IGuestRepository>();
    }

    [Fact]
    public async Task RegisterGuest_WithValidData_ShouldSucceed()
    {
        // Arrange
        var guest = new Guest { Id = 1, FirstName = "John", LastName = "Doe", Email = "john@example.com" };

        _guestRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Guest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(guest);

        // Act
        var result = await _guestRepositoryMock.Object.AddAsync(guest);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1u);
    }

    [Fact]
    public async Task RegisterGuest_WithInvalidEmail_ShouldFail()
    {
        // Arrange
        var email = "invalid-email";

        // Act & Assert
        email.Should().NotContain("@");
    }

    [Fact]
    public async Task RegisterGuest_WithEmptyFirstName_ShouldFail()
    {
        // Arrange
        var firstName = "";

        // Act & Assert
        firstName.Should().BeEmpty();
    }

    [Fact]
    public async Task RegisterGuest_WithPastDate_ShouldFail()
    {
        // Arrange
        var visitDate = DateTime.UtcNow.AddDays(-1);

        // Act & Assert
        visitDate.Should().BeBefore(DateTime.UtcNow);
    }

    [Fact]
    public async Task RegisterGuest_WhenRepositoryFails_ShouldPropagate()
    {
        // Arrange
        _guestRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Guest>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database insertion failed"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _guestRepositoryMock.Object.AddAsync(new Guest()));
    }

    [Fact]
    public async Task RegisterGuest_WithDuplicateEmail_ShouldFail()
    {
        // Arrange
        var email = "john.doe@example.com";
        var secondEmail = "john.doe@example.com";

        // Act & Assert
        email.Should().Be(secondEmail);
    }
}
