using FluentValidation;
using Riada.Application.DTOs.Requests.Contracts;

namespace Riada.Application.Validators;

public class CreateContractValidator : AbstractValidator<CreateContractRequest>
{
    public CreateContractValidator()
    {
        RuleFor(x => x.PlanId).GreaterThan((uint)0);
        RuleFor(x => x.HomeClubId).GreaterThan((uint)0);
        RuleFor(x => x.MemberId).GreaterThan((uint)0);
        RuleFor(x => x.StartDate).NotEmpty();
    }
}
