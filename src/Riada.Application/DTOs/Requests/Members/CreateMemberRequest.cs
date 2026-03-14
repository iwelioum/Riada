namespace Riada.Application.DTOs.Requests.Members;

public record CreateMemberRequest(
    string LastName,
    string FirstName,
    string Email,
    string Gender,
    DateOnly DateOfBirth,
    string? Nationality,
    string? MobilePhone,
    string? AddressStreet,
    string? AddressCity,
    string? AddressPostalCode,
    uint? ReferralMemberId,
    string? PrimaryGoal,
    string? AcquisitionSource,
    bool MedicalCertificateProvided,
    bool MarketingConsent);
