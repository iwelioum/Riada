using Riada.Domain.Enums;
using Riada.Domain.Entities.Membership;

namespace Riada.Domain.Entities.Billing;

public class InvoiceLine
{
    public uint Id { get; set; }
    public uint InvoiceId { get; set; }
    public string Description { get; set; } = null!;
    public InvoiceLineType LineType { get; set; }
    public uint? PlanId { get; set; }
    public uint? OptionId { get; set; }
    public uint Quantity { get; set; } = 1;
    public decimal UnitPriceExclTax { get; set; }
    public decimal VatRate { get; set; } = 0.2100m;

    // ⚠️ GENERATED COLUMNS — read-only
    public decimal LineAmountExclTax { get; set; }
    public decimal LineAmountInclTax { get; set; }

    // Navigation
    public Invoice Invoice { get; set; } = null!;
    public SubscriptionPlan? Plan { get; set; }
    public ServiceOption? Option { get; set; }
}
