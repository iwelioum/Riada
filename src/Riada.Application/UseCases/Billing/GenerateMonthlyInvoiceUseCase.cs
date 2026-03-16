using FluentValidation;
using Riada.Application.DTOs.Requests.Billing;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Billing;

public class GenerateMonthlyInvoiceUseCase
{
    private readonly IValidator<GenerateMonthlyInvoiceRequest> _validator;
    private readonly IBillingService _billingService;

    public GenerateMonthlyInvoiceUseCase(
        IValidator<GenerateMonthlyInvoiceRequest> validator,
        IBillingService billingService)
    {
        _validator = validator;
        _billingService = billingService;
    }

    public async Task<string> ExecuteAsync(GenerateMonthlyInvoiceRequest request, CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        return await _billingService.GenerateMonthlyInvoiceAsync(request.ContractId, ct);
    }
}

