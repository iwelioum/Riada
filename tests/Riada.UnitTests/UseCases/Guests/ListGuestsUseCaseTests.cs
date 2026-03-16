using FluentAssertions;
using Moq;
using Xunit;
using Riada.Application.DTOs.Responses.Common;
using Riada.Application.DTOs.Responses.Guests;
using Riada.Application.UseCases.Guests;
using Riada.Domain.Entities.AccessControl;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.UnitTests.UseCases.Guests;

public class ListGuestsUseCaseTests
{
    private readonly Mock<IGuestRepository> _guestRepositoryMock;
    private readonly ListGuestsUseCase _useCase;

    public ListGuestsUseCaseTests()
    {
        _guestRepositoryMock = new Mock<IGuestRepository>();
        _useCase = new ListGuestsUseCase(_guestRepositoryMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WithDefaultPagination_ShouldReturnFirstPage()
    {
        // Arrange
        var sponsorMember = new Member 
        { 
            Id = 1, 
            FirstName = "John", 
            LastName = "Sponsor",
            Email = "sponsor@example.com",
            DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-30))
        };

        var guests = new List<Guest>
        {
            new Guest 
            { 
                Id = 1, 
                FirstName = "Alice", 
                LastName = "Guest",
                DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-20)),
                Status = GuestStatus.Active,
                SponsorMemberId = 1,
                SponsorMember = sponsorMember
            }
        };

        _guestRepositoryMock
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((guests, 1));

        // Act
        var result = await _useCase.ExecuteAsync(1, 50);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.TotalCount.Should().Be(1);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(50);
        result.Items[0].FirstName.Should().Be("Alice");
        result.Items[0].SponsorName.Should().Be("John Sponsor");
    }

    [Fact]
    public async Task ExecuteAsync_WithMultiplePages_ShouldCalculateCorrectly()
    {
        // Arrange
        var sponsorMember = new Member 
        { 
            Id = 1, 
            FirstName = "John", 
            LastName = "Sponsor",
            Email = "sponsor@example.com",
            DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-30))
        };

        var guests = Enumerable.Range(1, 50)
            .Select(i => new Guest
            {
                Id = (uint)i,
                FirstName = $"Guest{i}",
                LastName = "TestGuest",
                DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-20)),
                Status = GuestStatus.Active,
                SponsorMemberId = 1,
                SponsorMember = sponsorMember
            })
            .ToList();

        _guestRepositoryMock
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((guests, 150)); // 150 total guests

        // Act
        var result = await _useCase.ExecuteAsync(2, 50);

        // Assert
        result.Items.Should().HaveCount(50);
        result.TotalCount.Should().Be(150);
        result.TotalPages.Should().Be(3);
        result.Page.Should().Be(2);
        result.HasNext.Should().BeTrue();
        result.HasPrevious.Should().BeTrue();
    }

    [Fact]
    public async Task ExecuteAsync_WithEmptyResult_ShouldReturnEmptyList()
    {
        // Arrange
        _guestRepositoryMock
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Guest>(), 0));

        // Act
        var result = await _useCase.ExecuteAsync(1, 50);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.TotalPages.Should().Be(0);
    }

    [Fact]
    public async Task ExecuteAsync_WithNullSponsor_ShouldHandleGracefully()
    {
        // Arrange
        var guests = new List<Guest>
        {
            new Guest 
            { 
                Id = 1, 
                FirstName = "Orphan", 
                LastName = "Guest",
                DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-20)),
                Status = GuestStatus.Active,
                SponsorMemberId = null,
                SponsorMember = null
            }
        };

        _guestRepositoryMock
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((guests, 1));

        // Act
        var result = await _useCase.ExecuteAsync(1, 50);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].SponsorName.Should().BeNull();
    }

    [Fact]
    public async Task ExecuteAsync_ShouldCallRepositoryWithCorrectPaginationParameters()
    {
        // Arrange
        _guestRepositoryMock
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Guest>(), 0));

        // Act
        await _useCase.ExecuteAsync(3, 25);

        // Assert
        _guestRepositoryMock.Verify(
            r => r.GetPagedAsync(3, 25, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_LastPageWithPartialResults_ShouldHaveNoNext()
    {
        // Arrange
        var sponsorMember = new Member 
        { 
            Id = 1, 
            FirstName = "John", 
            LastName = "Sponsor",
            Email = "sponsor@example.com",
            DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-30))
        };

        var guests = new List<Guest>
        {
            new Guest 
            { 
                Id = 1, 
                FirstName = "Last", 
                LastName = "Guest",
                DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-20)),
                Status = GuestStatus.Active,
                SponsorMemberId = 1,
                SponsorMember = sponsorMember
            }
        };

        _guestRepositoryMock
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((guests, 51)); // 51 total on page 2 (25 per page)

        // Act
        var result = await _useCase.ExecuteAsync(3, 25);

        // Assert
        result.HasNext.Should().BeFalse();
        result.HasPrevious.Should().BeTrue();
        result.TotalPages.Should().Be(3);
    }
}
