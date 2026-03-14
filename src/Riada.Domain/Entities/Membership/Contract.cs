using Riada.Domain.Enums;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Entities.Billing;

namespace Riada.Domain.Entities.Membership;

public class Contract
{
    public uint Id { get; set; }
    public uint? MemberId { get; set; }
    public uint PlanId { get; set; }
    public uint HomeClubId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public ContractType ContractType { get; set; } = ContractType.FixedTerm;
    public ContractStatus Status { get; set; } = ContractStatus.Active;
    public DateOnly? CancelledOn { get; set; }
    public string? CancellationReason { get; set; }
    public DateOnly? FreezeStartDate { get; set; }
    public DateOnly? FreezeEndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Member? Member { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;
    public Club HomeClub { get; set; } = null!;
    public ICollection<ContractOption> ContractOptions { get; set; } = [];
    public ICollection<Invoice> Invoices { get; set; } = [];
}
