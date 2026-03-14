namespace Riada.Application.DTOs.Responses.Analytics;

public record MemberRiskScoreResponse(
    uint MemberId,
    string LastName,
    string FirstName,
    string PlanName,
    int OverdueInvoiceCount,
    int DeniedAccess60d,
    int RiskScore);
