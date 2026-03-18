namespace Riada.Application.DTOs.Responses.Billing;

public record InvoiceSummaryResponse(
    uint Id,
    string InvoiceNumber,
    DateOnly IssuedOn,
    DateOnly DueDate,
    decimal AmountInclTax,
    decimal AmountPaid,
    decimal BalanceDue,
    string Status,
    uint? ContractId,
    uint? MemberId,
    string? MemberName);
