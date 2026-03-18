namespace Riada.Application.DTOs.Responses.Billing;

public record InvoiceDetailResponse(
    uint Id,
    uint? ContractId,
    uint? MemberId,
    string? MemberName,
    string InvoiceNumber,
    DateOnly IssuedOn,
    DateOnly DueDate,
    DateOnly BillingPeriodStart,
    DateOnly BillingPeriodEnd,
    decimal AmountExclTax,
    decimal VatRate,
    decimal VatAmount,
    decimal AmountInclTax,
    decimal AmountPaid,
    decimal BalanceDue,
    string Status,
    IReadOnlyList<InvoiceLineResponse> Lines,
    IReadOnlyList<InvoicePaymentResponse> Payments);

public record InvoiceLineResponse(
    string Description,
    string LineType,
    uint Quantity,
    decimal UnitPriceExclTax,
    decimal LineAmountInclTax);

public record PaymentResponse(
    uint Id,
    uint InvoiceId,
    decimal Amount,
    string PaymentMethod,
    string? TransactionReference,
    string Status);

public record InvoicePaymentResponse(
    uint Id,
    DateTime PaidAt,
    decimal Amount,
    string Status,
    string PaymentMethod,
    string? TransactionReference);
