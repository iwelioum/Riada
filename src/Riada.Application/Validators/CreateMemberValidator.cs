using FluentValidation;
using Riada.Application.DTOs.Requests.Members;

namespace Riada.Application.Validators;

public class CreateMemberValidator : AbstractValidator<CreateMemberRequest>
{
    public CreateMemberValidator()
    {
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
        RuleFor(x => x.DateOfBirth)
            .Must(dob => dob <= DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-16)))
            .WithMessage("Member must be at least 16 years old.");
        RuleFor(x => x.Gender)
            .Must(g => g is "male" or "female" or "unspecified")
            .WithMessage("Gender must be male, female, or unspecified.");
    }
}
