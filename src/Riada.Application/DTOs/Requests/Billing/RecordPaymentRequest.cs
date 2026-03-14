namespace Riada.Application.DTOs.Requests.Billing;

public record RecordPaymentRequest(
    uint InvoiceId,
    decimal Amount,
    string PaymentMethod,
    string? TransactionReference,
    string? ErrorCode);
