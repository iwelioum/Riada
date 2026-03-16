using FluentValidation;
using Riada.Application.DTOs.Requests.Members;

namespace Riada.Application.Validators;

public class UpdateMemberValidator : AbstractValidator<UpdateMemberRequest>
{
    public UpdateMemberValidator()
    {
        RuleFor(x => x.LastName)
            .NotEmpty()
            .MaximumLength(100)
            .When(x => x.LastName != null);

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(100)
            .When(x => x.FirstName != null);

        RuleFor(x => x.Gender)
            .Must(g => g is "male" or "female" or "unspecified")
            .WithMessage("Gender must be male, female, or unspecified.")
            .When(x => x.Gender != null);

        RuleFor(x => x.Nationality)
            .NotEmpty()
            .MaximumLength(100)
            .When(x => x.Nationality != null);

        RuleFor(x => x.MobilePhone)
            .NotEmpty()
            .MaximumLength(20)
            .When(x => x.MobilePhone != null);

        RuleFor(x => x.AddressStreet)
            .NotEmpty()
            .MaximumLength(255)
            .When(x => x.AddressStreet != null);

        RuleFor(x => x.AddressCity)
            .NotEmpty()
            .MaximumLength(120)
            .When(x => x.AddressCity != null);

        RuleFor(x => x.AddressPostalCode)
            .NotEmpty()
            .MaximumLength(20)
            .When(x => x.AddressPostalCode != null);

        RuleFor(x => x.PrimaryGoal)
            .Must(v => Enum.TryParse<Domain.Enums.PrimaryGoal>(v, true, out _))
            .WithMessage("PrimaryGoal is invalid.")
            .When(x => x.PrimaryGoal != null);

        RuleFor(x => x.AcquisitionSource)
            .Must(v => Enum.TryParse<Domain.Enums.AcquisitionSource>(v, true, out _))
            .WithMessage("AcquisitionSource is invalid.")
            .When(x => x.AcquisitionSource != null);
    }
}
