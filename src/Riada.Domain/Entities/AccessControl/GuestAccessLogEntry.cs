using Riada.Domain.Enums;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Entities.ClubManagement;

namespace Riada.Domain.Entities.AccessControl;

public class GuestAccessLogEntry
{
    public ulong Id { get; set; }
    public uint GuestId { get; set; }
    public uint? CompanionMemberId { get; set; }
    public uint ClubId { get; set; }
    public DateTime AccessedAt { get; set; }
    public AccessDecision AccessStatus { get; set; }
    public string? DenialReason { get; set; }

    // Navigation
    public Guest Guest { get; set; } = null!;
    public Member? CompanionMember { get; set; }
    public Club Club { get; set; } = null!;
}
