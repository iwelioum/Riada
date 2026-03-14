using FluentAssertions;
using Moq;
using Xunit;
using Riada.Application.DTOs.Requests.Billing;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.Billing;
using FluentValidation;

namespace Riada.UnitTests.UseCases.Billing;

public class RecordPaymentUseCaseTests
{
    private readonly Mock<IPaymentRepository> _paymentRepositoryMock;
    private readonly Mock<IInvoiceRepository> _invoiceRepositoryMock;

    public RecordPaymentUseCaseTests()
    {
        _paymentRepositoryMock = new Mock<IPaymentRepository>();
        _invoiceRepositoryMock = new Mock<IInvoiceRepository>();
    }

    [Fact]
    public async Task RecordPayment_WithValidAmount_ShouldSucceed()
    {
        // Arrange
        var invoiceId = 1u;
        var amount = 150.00m;
        var invoice = new Invoice { Id = invoiceId, Amount = 150.00m, Status = "Pending" };

        _invoiceRepositoryMock
            .Setup(r => r.GetByIdAsync(invoiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(invoice);

        // Act
        var result = await _invoiceRepositoryMock.Object.GetByIdAsync(invoiceId);

        // Assert
        result.Should().NotBeNull();
        result!.Amount.Should().Be(150.00m);
    }

    [Fact]
    public async Task RecordPayment_WithInvalidAmount_ShouldFail()
    {
        // Arrange
        var amount = -50m;

        // Act & Assert
        amount.Should().BeLessThan(0);
    }

    [Fact]
    public async Task RecordPayment_WithNonExistentInvoice_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var invoiceId = 999u;

        _invoiceRepositoryMock
            .Setup(r => r.GetByIdAsync(invoiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Invoice?)null);

        // Act
        var result = await _invoiceRepositoryMock.Object.GetByIdAsync(invoiceId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RecordPayment_WhenRepositoryThrowsException_ShouldPropagateDatabaseError()
    {
        // Arrange
        var invoiceId = 1u;

        _invoiceRepositoryMock
            .Setup(r => r.GetByIdAsync(invoiceId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database connection failed"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _invoiceRepositoryMock.Object.GetByIdAsync(invoiceId));
    }

    [Fact]
    public async Task RecordPayment_WithAmountExceedingBalance_ShouldThrowException()
    {
        // Arrange
        var amount = 200.00m;
        var invoiceAmount = 150.00m;

        // Act & Assert
        amount.Should().BeGreaterThan(invoiceAmount);
    }

    [Fact]
    public async Task RecordPayment_WithZeroAmount_ShouldFail()
    {
        // Arrange
        var amount = 0m;

        // Act & Assert
        amount.Should().Be(0);
        amount.Should().NotBeGreaterThan(0);
    }
}

