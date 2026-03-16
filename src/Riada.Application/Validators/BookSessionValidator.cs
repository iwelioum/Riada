using FluentValidation;
using Riada.Application.DTOs.Requests.Courses;

namespace Riada.Application.Validators;

public class BookSessionValidator : AbstractValidator<BookSessionRequest>
{
    public BookSessionValidator()
    {
        RuleFor(x => x.MemberId).GreaterThan((uint)0).WithMessage("Member ID must be greater than 0.");
        RuleFor(x => x.SessionId).GreaterThan((uint)0).WithMessage("Session ID must be greater than 0.");
    }
}
