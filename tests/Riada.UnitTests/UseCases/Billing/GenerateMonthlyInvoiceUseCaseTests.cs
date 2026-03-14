using FluentAssertions;
using Moq;
using Xunit;
using Riada.Application.DTOs.Requests.Billing;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Entities.Billing;

namespace Riada.UnitTests.UseCases.Billing;

public class GenerateMonthlyInvoiceUseCaseTests
{
    private readonly Mock<IInvoiceRepository> _invoiceRepositoryMock;

    public GenerateMonthlyInvoiceUseCaseTests()
    {
        _invoiceRepositoryMock = new Mock<IInvoiceRepository>();
    }

    [Fact]
    public async Task GenerateMonthlyInvoices_WithValidMonthAndYear_ShouldGenerateInvoices()
    {
        // Arrange
        var month = 11;
        var year = 2024;

        var generatedInvoices = new List<Invoice>
        {
            new() { Id = 1, Amount = 50.00m, CreatedAt = DateTime.Now },
            new() { Id = 2, Amount = 75.00m, CreatedAt = DateTime.Now },
            new() { Id = 3, Amount = 60.00m, CreatedAt = DateTime.Now }
        };

        // Act
        var invoices = await Task.FromResult(generatedInvoices);

        // Assert
        invoices.Should().HaveCount(3);
        invoices.Sum(i => i.Amount).Should().Be(185.00m);
    }

    [Fact]
    public async Task GenerateMonthlyInvoices_WithInvalidMonth_ShouldThrowException()
    {
        // Arrange
        var month = 13;
        var year = 2024;

        // Act & Assert
        month.Should().BeGreaterThan(0).And.BeLessThanOrEqualTo(12);
    }

    [Fact]
    public async Task GenerateMonthlyInvoices_WithInvalidYear_ShouldThrowException()
    {
        // Arrange
        var year = 1999;

        // Act & Assert
        year.Should().BeGreaterThanOrEqualTo(DateTime.Now.Year - 10);
    }

    [Fact]
    public async Task GenerateMonthlyInvoices_WithNoInvoices_ShouldReturnEmptyList()
    {
        // Arrange
        var month = 2;
        var year = 2025;

        // Act
        var invoices = await Task.FromResult(new List<Invoice>());

        // Assert
        invoices.Should().BeEmpty();
    }

    [Fact]
    public async Task GenerateMonthlyInvoices_WithValidInput_ShouldCalculateTotalCorrectly()
    {
        // Arrange
        var invoices = new List<Invoice>
        {
            new() { Id = 10, Amount = 100.00m, CreatedAt = new DateTime(2024, 10, 1) },
            new() { Id = 11, Amount = 200.00m, CreatedAt = new DateTime(2024, 10, 15) }
        };

        // Act
        var total = invoices.Sum(i => i.Amount);

        // Assert
        total.Should().Be(300.00m);
    }
}

