using Riada.Application.DTOs.Requests.Billing;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Application.UseCases.Billing;

public class GenerateMonthlyInvoiceUseCase
{
    private readonly IBillingService _billingService;

    public GenerateMonthlyInvoiceUseCase(IBillingService billingService)
        => _billingService = billingService;

    public async Task<string> ExecuteAsync(GenerateMonthlyInvoiceRequest request, CancellationToken ct = default)
        => await _billingService.GenerateMonthlyInvoiceAsync(request.ContractId, ct);
}
