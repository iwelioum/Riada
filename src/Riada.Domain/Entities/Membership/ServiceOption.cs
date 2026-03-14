namespace Riada.Domain.Entities.Membership;

public class ServiceOption
{
    public uint Id { get; set; }
    public string OptionName { get; set; } = null!;
    public decimal MonthlyPrice { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<SubscriptionPlanOption> PlanOptions { get; set; } = [];
    public ICollection<ContractOption> ContractOptions { get; set; } = [];
}
