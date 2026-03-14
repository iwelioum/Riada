using Moq;
using Xunit;
using FluentAssertions;
using Riada.Application.UseCases.Members;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.UnitTests.UseCases.Members;

public class GetMemberDetailUseCaseTests
{
    private readonly Mock<IMemberRepository> _memberRepositoryMock;
    private readonly GetMemberDetailUseCase _useCase;

    public GetMemberDetailUseCaseTests()
    {
        _memberRepositoryMock = new Mock<IMemberRepository>();
        _useCase = new GetMemberDetailUseCase(_memberRepositoryMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WithValidMemberId_ReturnsMemberDetail()
    {
        // Arrange
        var memberId = 1u;
        var member = new Member
        {
            Id = memberId,
            LastName = "Dupont",
            FirstName = "Jean",
            Email = "jean.dupont@example.com",
            Gender = Gender.Male,
            Status = MemberStatus.Active,
            DateOfBirth = new DateOnly(1990, 1, 1),
            Contracts = new List<Contract>()
        };

        _memberRepositoryMock
            .Setup(r => r.GetWithContractsAsync(memberId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);

        // Act
        var result = await _useCase.ExecuteAsync(memberId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(memberId);
        result.FirstName.Should().Be("Jean");
        result.LastName.Should().Be("Dupont");
        result.Status.Should().Be("Active");
    }

    [Fact]
    public async Task ExecuteAsync_WithInvalidMemberId_ThrowsNotFoundException()
    {
        // Arrange
        var memberId = 9999u;
        _memberRepositoryMock
            .Setup(r => r.GetWithContractsAsync(memberId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Member?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => 
            _useCase.ExecuteAsync(memberId));
    }
}
