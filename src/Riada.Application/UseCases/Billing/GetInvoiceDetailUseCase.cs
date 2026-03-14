using Riada.Application.DTOs.Responses.Billing;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Billing;

public class GetInvoiceDetailUseCase
{
    private readonly IInvoiceRepository _invoiceRepository;

    public GetInvoiceDetailUseCase(IInvoiceRepository invoiceRepository)
        => _invoiceRepository = invoiceRepository;

    public async Task<InvoiceDetailResponse> ExecuteAsync(uint invoiceId, CancellationToken ct = default)
    {
        var invoice = await _invoiceRepository.GetWithLinesAndPaymentsAsync(invoiceId, ct)
            ?? throw new NotFoundException("Invoice", invoiceId);

        return new InvoiceDetailResponse(
            invoice.Id,
            invoice.InvoiceNumber,
            invoice.IssuedOn,
            invoice.DueDate,
            invoice.BillingPeriodStart,
            invoice.BillingPeriodEnd,
            invoice.AmountExclTax,
            invoice.VatRate,
            invoice.VatAmount,
            invoice.AmountInclTax,
            invoice.AmountPaid,
            invoice.BalanceDue,
            invoice.Status.ToString(),
            invoice.Lines.Select(l => new InvoiceLineResponse(
                l.Description, l.LineType.ToString(), l.Quantity,
                l.UnitPriceExclTax, l.LineAmountInclTax)).ToList(),
            invoice.Payments.Select(p => new InvoicePaymentResponse(
                p.Id, p.PaidAt, p.Amount, p.Status.ToString(),
                p.PaymentMethod.ToString(), p.TransactionReference)).ToList());
    }
}
