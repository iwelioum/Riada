namespace Riada.Domain.Entities.Membership;

/// <summary>
/// Join table: subscription_plan_options (N-N between plans and options).
/// Composite PK (PlanId, OptionId).
/// </summary>
public class SubscriptionPlanOption
{
    public uint PlanId { get; set; }
    public uint OptionId { get; set; }

    // Navigation
    public SubscriptionPlan Plan { get; set; } = null!;
    public ServiceOption Option { get; set; } = null!;
}
