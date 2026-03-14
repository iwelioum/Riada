using Riada.Domain.Enums;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Entities.ClubManagement;

namespace Riada.Domain.Entities.AccessControl;

public class AccessLogEntry
{
    public ulong Id { get; set; }
    public uint? MemberId { get; set; }
    public uint ClubId { get; set; }
    public DateTime AccessedAt { get; set; }
    public AccessDecision AccessStatus { get; set; }
    public string? DenialReason { get; set; }

    // Navigation
    public Member? Member { get; set; }
    public Club Club { get; set; } = null!;
}
