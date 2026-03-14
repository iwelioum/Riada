using FluentValidation;
using Riada.Application.DTOs.Requests.Members;

namespace Riada.Application.Validators;

public class UpdateMemberValidator : AbstractValidator<UpdateMemberRequest>
{
    public UpdateMemberValidator()
    {
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Gender)
            .Must(g => g is "male" or "female" or "unspecified")
            .WithMessage("Gender must be male, female, or unspecified.");
        RuleFor(x => x.Nationality).MaximumLength(100);
        RuleFor(x => x.MobilePhone).MaximumLength(20);
    }
}
