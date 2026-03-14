using FluentValidation;
using Riada.Application.DTOs.Requests.Members;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.Validators.Members;

/// <summary>
/// Complete member creation validation with async database checks
/// Demonstrates advanced FluentValidation patterns
/// </summary>
public class CreateMemberRequestValidator : AbstractValidator<CreateMemberRequest>
{
    private readonly IGenericRepository<Domain.Entities.Membership.Member> _memberRepository;

    public CreateMemberRequestValidator(IGenericRepository<Domain.Entities.Membership.Member> memberRepository)
    {
        _memberRepository = memberRepository;

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MinimumLength(2).WithMessage("First name must be at least 2 characters")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MinimumLength(2).WithMessage("Last name must be at least 2 characters")
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email format is invalid")
            .MustAsync(BeUniqueEmail).WithMessage("Email already registered");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .Must(BeValidAge).WithMessage("Member must be at least 16 years old")
            .Must(NotBeFutureDate).WithMessage("Date of birth cannot be in the future");

        RuleFor(x => x.MobilePhone)
            .Matches(@"^\+?[0-9]{10,15}$").When(x => !string.IsNullOrEmpty(x.MobilePhone))
            .WithMessage("Mobile phone format is invalid");
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken ct)
    {
        var existing = await _memberRepository.FindAsync(m => m.Email == email, ct);
        return !existing.Any();
    }

    private static bool BeValidAge(DateOnly dateOfBirth)
    {
        var age = DateTime.Now.Year - dateOfBirth.Year;
        return age >= 16;
    }

    private static bool NotBeFutureDate(DateOnly date) =>
        date <= DateOnly.FromDateTime(DateTime.Now);
}
