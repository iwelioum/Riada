using FluentValidation;
using Riada.Application.DTOs.Requests.Billing;

namespace Riada.Application.Validators;

public class RecordPaymentValidator : AbstractValidator<RecordPaymentRequest>
{
    public RecordPaymentValidator()
    {
        RuleFor(x => x.InvoiceId).GreaterThan((uint)0);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.PaymentMethod).NotEmpty().MaximumLength(50);
        RuleFor(x => x.TransactionReference).MaximumLength(100);
    }
}
