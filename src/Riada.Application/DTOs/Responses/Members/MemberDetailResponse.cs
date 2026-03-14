using Riada.Application.DTOs.Responses.Contracts;

namespace Riada.Application.DTOs.Responses.Members;

public record MemberDetailResponse(
    uint Id,
    string LastName,
    string FirstName,
    string Email,
    string Gender,
    DateOnly DateOfBirth,
    string Nationality,
    string? MobilePhone,
    string Status,
    string? PrimaryGoal,
    DateOnly? LastVisitDate,
    uint TotalVisits,
    DateTime GdprConsentAt,
    bool MarketingConsent,
    IReadOnlyList<ContractResponse> Contracts);
