using FluentAssertions;
using FluentValidation;
using Moq;
using Riada.Application.DTOs.Requests.Members;
using Riada.Application.Events;
using Riada.Application.UseCases.Members;
using Riada.Application.Validators;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;
using Xunit;

namespace Riada.UnitTests.UseCases.Members;

public class CreateMemberUseCaseTests
{
    private readonly Mock<IMemberRepository> _memberRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly IValidator<CreateMemberRequest> _validator = new CreateMemberValidator();
    private readonly Mock<IMemberEventDispatcher> _memberEventDispatcherMock = new();

    private CreateMemberUseCase CreateSut()
    {
        return new CreateMemberUseCase(
            _memberRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _validator,
            _memberEventDispatcherMock.Object);
    }

    private static CreateMemberRequest BuildValidRequest() =>
        new(
            LastName: "Doe",
            FirstName: "John",
            Email: "john.doe@example.com",
            Gender: "male",
            DateOfBirth: new DateOnly(1990, 1, 1),
            Nationality: "Belgian",
            MobilePhone: null,
            AddressStreet: null,
            AddressCity: null,
            AddressPostalCode: null,
            ReferralMemberId: null,
            PrimaryGoal: null,
            AcquisitionSource: null,
            MedicalCertificateProvided: true,
            MarketingConsent: false);

    [Fact]
    public async Task ExecuteAsync_ShouldCreateMember_WhenRequestIsValid()
    {
        // Arrange
        var sut = CreateSut();
        Member? capturedMember = null;
        _memberRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Member>(), It.IsAny<CancellationToken>()))
            .Callback<Member, CancellationToken>((m, _) => capturedMember = m)
            .ReturnsAsync((Member m, CancellationToken _) => m);
        _unitOfWorkMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var request = BuildValidRequest();

        // Act
        var response = await sut.ExecuteAsync(request);

        // Assert
        capturedMember.Should().NotBeNull();
        capturedMember!.FirstName.Should().Be("John");
        capturedMember.LastName.Should().Be("Doe");
        capturedMember.Gender.Should().Be(Gender.Male);
        capturedMember.Status.Should().Be(MemberStatus.Active);

        response.Id.Should().Be(capturedMember.Id);
        response.Email.Should().Be("john.doe@example.com");
    }

    [Fact]
    public async Task ExecuteAsync_ShouldPublishEvent_WhenMemberCreated()
    {
        // Arrange
        var sut = CreateSut();
        _memberRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Member>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Member m, CancellationToken _) => m);
        _unitOfWorkMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var request = BuildValidRequest();

        // Act
        await sut.ExecuteAsync(request);

        // Assert
        _memberEventDispatcherMock.Verify(d => d.PublishMemberCreated(It.IsAny<Member>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldThrow_WhenValidationFails()
    {
        // Arrange
        var sut = CreateSut();
        var invalidRequest = BuildValidRequest() with { Email = "not-an-email" };

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => sut.ExecuteAsync(invalidRequest));
        _memberRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Member>(), It.IsAny<CancellationToken>()), Times.Never);
        _memberEventDispatcherMock.Verify(d => d.PublishMemberCreated(It.IsAny<Member>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldSetDefaultStatusToActive()
    {
        // Arrange
        var sut = CreateSut();
        Member? capturedMember = null;
        _memberRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Member>(), It.IsAny<CancellationToken>()))
            .Callback<Member, CancellationToken>((m, _) => capturedMember = m)
            .ReturnsAsync((Member m, CancellationToken _) => m);
        _unitOfWorkMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await sut.ExecuteAsync(BuildValidRequest());

        // Assert
        capturedMember.Should().NotBeNull();
        capturedMember!.Status.Should().Be(MemberStatus.Active);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldPropagateUnitOfWorkErrors()
    {
        // Arrange
        var sut = CreateSut();
        _memberRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Member>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Member m, CancellationToken _) => m);
        _unitOfWorkMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("db down"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.ExecuteAsync(BuildValidRequest()));
        _memberEventDispatcherMock.Verify(d => d.PublishMemberCreated(It.IsAny<Member>()), Times.Never);
    }
}
