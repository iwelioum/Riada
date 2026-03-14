using FluentValidation;
using Riada.Application.DTOs.Requests.Equipment;

namespace Riada.Application.Validators;

public class CreateMaintenanceTicketValidator : AbstractValidator<CreateMaintenanceTicketRequest>
{
    public CreateMaintenanceTicketValidator()
    {
        RuleFor(x => x.EquipmentId).GreaterThan((uint)0);
        RuleFor(x => x.Priority)
            .Must(p => p is "Low" or "Medium" or "High" or "Critical")
            .WithMessage("Priority must be Low, Medium, High, or Critical.");
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
    }
}
