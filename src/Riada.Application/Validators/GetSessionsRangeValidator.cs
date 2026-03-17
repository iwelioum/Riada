using FluentValidation;
using Riada.Application.DTOs.Requests.Courses;

namespace Riada.Application.Validators;

public class GetSessionsRangeValidator : AbstractValidator<GetSessionsRangeRequest>
{
    private const int MaxRangeDays = 60;

    public GetSessionsRangeValidator()
    {
        RuleFor(x => x.ClubId)
            .GreaterThan((uint)0)
            .WithMessage("Club ID must be greater than 0.");

        RuleFor(x => x.From)
            .NotEmpty()
            .WithMessage("'from' is required.");

        RuleFor(x => x.To)
            .NotEmpty()
            .WithMessage("'to' is required.");

        RuleFor(x => x)
            .Must(x => x.From <= x.To)
            .WithMessage("'from' must be earlier than or equal to 'to'.");

        RuleFor(x => x)
            .Must(x => (x.To - x.From).TotalDays <= MaxRangeDays)
            .When(x => x.From <= x.To)
            .WithMessage($"Requested range cannot exceed {MaxRangeDays} days.");
    }
}
