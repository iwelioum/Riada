using Riada.Domain.Enums;
using Riada.Domain.Entities.Membership;

namespace Riada.Domain.Entities.Billing;

public class Invoice
{
    public uint Id { get; set; }
    public uint? ContractId { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public DateOnly IssuedOn { get; set; }
    public DateOnly DueDate { get; set; }
    public DateOnly BillingPeriodStart { get; set; }
    public DateOnly BillingPeriodEnd { get; set; }
    public decimal AmountExclTax { get; set; }
    public decimal VatRate { get; set; } = 0.2100m;

    // ⚠️ GENERATED COLUMNS — read-only, computed by MySQL
    public decimal VatAmount { get; set; }
    public decimal AmountInclTax { get; set; }
    public decimal BalanceDue { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Issued;
    public decimal AmountPaid { get; set; }
    public DateTime? PaidInFullAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Contract? Contract { get; set; }
    public ICollection<InvoiceLine> Lines { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}
