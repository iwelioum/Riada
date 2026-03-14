using FluentValidation;
using Riada.Application.DTOs.Requests.Guests;

namespace Riada.Application.Validators;

public class RegisterGuestValidator : AbstractValidator<RegisterGuestRequest>
{
    public RegisterGuestValidator()
    {
        RuleFor(x => x.SponsorMemberId).GreaterThan((uint)0);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DateOfBirth)
            .Must(dob => dob <= DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-16)))
            .WithMessage("Guest must be at least 16 years old (Duo Pass).");
    }
}
