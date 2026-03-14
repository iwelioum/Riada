using FluentValidation;
using Riada.Application.DTOs.Requests.Billing;
using Riada.Application.DTOs.Responses.Billing;
using Riada.Domain.Entities.Billing;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Billing;

public class RecordPaymentUseCase
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IValidator<RecordPaymentRequest> _validator;

    public RecordPaymentUseCase(
        IPaymentRepository paymentRepository,
        IInvoiceRepository invoiceRepository,
        IValidator<RecordPaymentRequest> validator)
    {
        _paymentRepository = paymentRepository;
        _invoiceRepository = invoiceRepository;
        _validator = validator;
    }

    public async Task<CreatePaymentResponse> ExecuteAsync(
        RecordPaymentRequest request,
        CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId, ct)
            ?? throw new NotFoundException("Invoice", request.InvoiceId);

        var payment = new Payment
        {
            InvoiceId = request.InvoiceId,
            Amount = request.Amount,
            PaymentMethod = Enum.Parse<PaymentMethod>(request.PaymentMethod),
            TransactionReference = request.TransactionReference,
            PaidAt = DateTime.UtcNow,
            Status = PaymentStatus.Succeeded,
            ErrorCode = request.ErrorCode
        };

        await _paymentRepository.AddAsync(payment, ct);
        await _paymentRepository.SaveChangesAsync(ct);

        return new CreatePaymentResponse(
            payment.Id,
            payment.InvoiceId,
            payment.Amount,
            payment.PaymentMethod.ToString(),
            payment.TransactionReference,
            payment.PaidAt,
            payment.Status.ToString());
    }
}
