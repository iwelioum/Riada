using Riada.Domain.Entities.Membership;

namespace Riada.Domain.Entities.Compliance;

public class AuditGdpr
{
    public ulong Id { get; set; }
    public uint MemberId { get; set; }
    public DateTime AnonymizedAt { get; set; }
    public string RequestedBy { get; set; } = null!;

    // Navigation
    public Member Member { get; set; } = null!;
}
