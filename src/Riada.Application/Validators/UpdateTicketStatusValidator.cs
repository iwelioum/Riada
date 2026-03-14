using FluentValidation;
using Riada.Application.DTOs.Requests.Equipment;

namespace Riada.Application.Validators;

public class UpdateTicketStatusValidator : AbstractValidator<UpdateTicketStatusRequest>
{
    public UpdateTicketStatusValidator()
    {
        RuleFor(x => x.Status)
            .Must(s => s is "Open" or "InProgress" or "Resolved" or "Closed")
            .WithMessage("Status must be Open, InProgress, Resolved, or Closed.");
    }
}
