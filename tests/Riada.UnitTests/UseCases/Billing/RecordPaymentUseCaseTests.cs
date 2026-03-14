using FluentAssertions;
using Moq;
using Xunit;
using Riada.Application.UseCases.Billing;
using Riada.Application.DTOs.Requests.Billing;
using Riada.Application.DTOs.Responses.Billing;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.Billing;
using FluentValidation;

namespace Riada.UnitTests.UseCases.Billing;

public class RecordPaymentUseCaseTests
{
    private readonly Mock<IPaymentRepository> _paymentRepositoryMock;
    private readonly Mock<IInvoiceRepository> _invoiceRepositoryMock;
    private readonly Mock<IValidator<RecordPaymentRequest>> _validatorMock;
    private readonly RecordPaymentUseCase _useCase;

    public RecordPaymentUseCaseTests()
    {
        _paymentRepositoryMock = new Mock<IPaymentRepository>();
        _invoiceRepositoryMock = new Mock<IInvoiceRepository>();
        _validatorMock = new Mock<IValidator<RecordPaymentRequest>>();
        _useCase = new RecordPaymentUseCase(
            _paymentRepositoryMock.Object,
            _invoiceRepositoryMock.Object,
            _validatorMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WithValidPayment_ShouldRecordPaymentAndReturnResponse()
    {
        // Arrange
        var request = new RecordPaymentRequest
        {
            InvoiceId = 1,
            Amount = 150.00m,
            PaymentMethod = "Credit Card",
            TransactionId = "TXN12345"
        };

        var invoice = new Invoice { Id = 1, Amount = 150.00m, Status = "Pending" };
        var paymentId = "PAY001";

        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _invoiceRepositoryMock
            .Setup(r => r.GetByIdAsync(request.InvoiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(invoice);

        _paymentRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Payment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(paymentId);

        // Act
        var result = await _useCase.ExecuteAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PaymentId.Should().Be(paymentId);
        result.Status.Should().Be("Recorded");
        _paymentRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Payment>(), It.IsAny<CancellationToken>()), Times.Once);
        _invoiceRepositoryMock.Verify(r => r.GetByIdAsync(request.InvoiceId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WithInvalidRequest_ShouldThrowValidationException()
    {
        // Arrange
        var request = new RecordPaymentRequest
        {
            InvoiceId = 0,
            Amount = -50m,
            PaymentMethod = "",
            TransactionId = ""
        };

        var validationFailure = new FluentValidation.Results.ValidationFailure("Amount", "Amount must be greater than zero");
        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult { validationFailure });

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => _useCase.ExecuteAsync(request));
    }

    [Fact]
    public async Task ExecuteAsync_WithNonExistentInvoice_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var request = new RecordPaymentRequest
        {
            InvoiceId = 999,
            Amount = 100.00m,
            PaymentMethod = "Credit Card",
            TransactionId = "TXN67890"
        };

        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _invoiceRepositoryMock
            .Setup(r => r.GetByIdAsync(request.InvoiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Invoice?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _useCase.ExecuteAsync(request));
    }

    [Fact]
    public async Task ExecuteAsync_WhenRepositoryThrowsException_ShouldPropagateDatabaseError()
    {
        // Arrange
        var request = new RecordPaymentRequest
        {
            InvoiceId = 1,
            Amount = 150.00m,
            PaymentMethod = "Credit Card",
            TransactionId = "TXN12345"
        };

        var invoice = new Invoice { Id = 1, Amount = 150.00m, Status = "Pending" };

        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _invoiceRepositoryMock
            .Setup(r => r.GetByIdAsync(request.InvoiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(invoice);

        _paymentRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Payment>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database connection failed"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _useCase.ExecuteAsync(request));
    }

    [Fact]
    public async Task ExecuteAsync_WithAmountExceedingInvoiceAmount_ShouldThrowArgumentException()
    {
        // Arrange
        var request = new RecordPaymentRequest
        {
            InvoiceId = 1,
            Amount = 200.00m,
            PaymentMethod = "Credit Card",
            TransactionId = "TXN12345"
        };

        var invoice = new Invoice { Id = 1, Amount = 150.00m, Status = "Pending" };

        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _invoiceRepositoryMock
            .Setup(r => r.GetByIdAsync(request.InvoiceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(invoice);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _useCase.ExecuteAsync(request));
    }

    [Fact]
    public async Task ExecuteAsync_WithZeroAmount_ShouldThrowArgumentException()
    {
        // Arrange
        var request = new RecordPaymentRequest
        {
            InvoiceId = 1,
            Amount = 0m,
            PaymentMethod = "Credit Card",
            TransactionId = "TXN12345"
        };

        var validationFailure = new FluentValidation.Results.ValidationFailure("Amount", "Amount must be greater than zero");
        _validatorMock
            .Setup(v => v.ValidateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult { validationFailure });

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => _useCase.ExecuteAsync(request));
    }
}
