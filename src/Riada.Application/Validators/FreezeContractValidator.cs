using FluentValidation;
using Riada.Application.DTOs.Requests.Contracts;

namespace Riada.Application.Validators;

public class FreezeContractValidator : AbstractValidator<FreezeContractRequest>
{
    public FreezeContractValidator()
    {
        RuleFor(x => x.ContractId).GreaterThan((uint)0);
        RuleFor(x => x.DurationDays).InclusiveBetween((uint)1, (uint)365)
            .WithMessage("Freeze duration must be between 1 and 365 days.");
    }
}
