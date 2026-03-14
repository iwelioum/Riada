namespace Riada.Application.DTOs.Responses.Billing;

public record CreatePaymentResponse(
    uint Id,
    uint InvoiceId,
    decimal Amount,
    string PaymentMethod,
    string? TransactionReference,
    DateTime PaidAt,
    string Status);
