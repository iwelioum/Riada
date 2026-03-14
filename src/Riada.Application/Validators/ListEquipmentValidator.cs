using FluentValidation;
using Riada.Application.DTOs.Requests.Equipment;

namespace Riada.Application.Validators;

public class ListEquipmentValidator : AbstractValidator<ListEquipmentRequest>
{
    public ListEquipmentValidator()
    {
        RuleFor(x => x.ClubId).GreaterThan((uint)0).When(x => x.ClubId.HasValue);
        RuleFor(x => x.Status)
            .Must(s => s == null || s is "active" or "maintenance" or "retired")
            .WithMessage("Status must be active, maintenance, or retired.");
    }
}
