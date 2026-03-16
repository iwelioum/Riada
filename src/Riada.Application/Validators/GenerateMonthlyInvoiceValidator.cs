using FluentValidation;
using Riada.Application.DTOs.Requests.Billing;

namespace Riada.Application.Validators;

public class GenerateMonthlyInvoiceValidator : AbstractValidator<GenerateMonthlyInvoiceRequest>
{
    public GenerateMonthlyInvoiceValidator()
    {
        RuleFor(x => x.ContractId).GreaterThan((uint)0).WithMessage("Contract ID must be greater than 0.");
    }
}
