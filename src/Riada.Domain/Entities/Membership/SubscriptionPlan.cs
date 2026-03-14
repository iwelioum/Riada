namespace Riada.Domain.Entities.Membership;

public class SubscriptionPlan
{
    public uint Id { get; set; }
    public string PlanName { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public uint CommitmentMonths { get; set; } = 12;
    public decimal EnrollmentFee { get; set; } = 19.99m;
    public bool LimitedClubAccess { get; set; }
    public bool DuoPassAllowed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<SubscriptionPlanOption> PlanOptions { get; set; } = [];
    public ICollection<Contract> Contracts { get; set; } = [];
}
