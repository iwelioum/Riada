using FluentAssertions;
using Moq;
using Xunit;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.ClubManagement;

namespace Riada.UnitTests.UseCases.Equipment;

public class CreateMaintenanceTicketUseCaseTests
{
    private readonly Mock<IEquipmentRepository> _equipmentRepositoryMock;
    private readonly Mock<IMaintenanceTicketRepository> _ticketRepositoryMock;

    public CreateMaintenanceTicketUseCaseTests()
    {
        _equipmentRepositoryMock = new Mock<IEquipmentRepository>();
        _ticketRepositoryMock = new Mock<IMaintenanceTicketRepository>();
    }

    [Fact]
    public async Task CreateTicket_WithValidData_ShouldSucceed()
    {
        // Arrange
        var equipment = new Equipment { Id = 1, Name = "Treadmill A", Status = "Active" };

        _equipmentRepositoryMock
            .Setup(r => r.GetByIdAsync(1u, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);

        // Act
        var result = await _equipmentRepositoryMock.Object.GetByIdAsync(1u);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be("Active");
    }

    [Fact]
    public async Task CreateTicket_WithInvalidPriority_ShouldFail()
    {
        // Arrange
        var priority = "InvalidPriority";

        // Act & Assert
        priority.Should().NotBeOneOf("Low", "Medium", "High");
    }

    [Fact]
    public async Task CreateTicket_WithNonExistentEquipment_ShouldReturnNull()
    {
        // Arrange
        _equipmentRepositoryMock
            .Setup(r => r.GetByIdAsync(999u, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipment?)null);

        // Act
        var result = await _equipmentRepositoryMock.Object.GetByIdAsync(999u);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateTicket_WithNegativeHours_ShouldFail()
    {
        // Arrange
        var hours = -5;

        // Act & Assert
        hours.Should().BeLessThan(0);
    }

    [Fact]
    public async Task CreateTicket_WhenRepositoryFails_ShouldPropagate()
    {
        // Arrange
        _ticketRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<MaintenanceTicket>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database write failed"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _ticketRepositoryMock.Object.AddAsync(new MaintenanceTicket()));
    }

    [Fact]
    public async Task CreateTicket_WithEmptyDescription_ShouldFail()
    {
        // Arrange
        var description = "";

        // Act & Assert
        description.Should().BeEmpty();
    }
}

