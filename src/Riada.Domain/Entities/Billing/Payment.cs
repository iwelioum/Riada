using Riada.Domain.Enums;

namespace Riada.Domain.Entities.Billing;

public class Payment
{
    public uint Id { get; set; }
    public uint InvoiceId { get; set; }
    public DateTime PaidAt { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.SepaDirectDebit;
    public string? TransactionReference { get; set; }
    public string? ErrorCode { get; set; }
    public byte AttemptCount { get; set; } = 1;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Invoice Invoice { get; set; } = null!;
}
