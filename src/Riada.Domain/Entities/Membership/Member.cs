using Riada.Domain.Enums;

namespace Riada.Domain.Entities.Membership;

public class Member
{
    public uint Id { get; set; }
    public string LastName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public Gender Gender { get; set; } = Gender.Unspecified;
    public DateOnly DateOfBirth { get; set; }
    public string Nationality { get; set; } = "Belgian";
    public string? MobilePhone { get; set; }
    public string? AddressStreet { get; set; }
    public string? AddressCity { get; set; }
    public string? AddressPostalCode { get; set; }
    public MemberStatus Status { get; set; } = MemberStatus.Active;
    public uint? ReferralMemberId { get; set; }
    public PrimaryGoal? PrimaryGoal { get; set; }
    public AcquisitionSource? AcquisitionSource { get; set; }
    public bool MedicalCertificateProvided { get; set; }
    public DateTime GdprConsentAt { get; set; }
    public bool MarketingConsent { get; set; }
    public DateOnly? LastVisitDate { get; set; }
    public uint TotalVisits { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Member? ReferralMember { get; set; }
    public ICollection<Member> ReferredMembers { get; set; } = [];
    public ICollection<Contract> Contracts { get; set; } = [];
}
