using Riada.Domain.Enums;
using Riada.Domain.Entities.Membership;

namespace Riada.Domain.Entities.AccessControl;

public class Guest
{
    public uint Id { get; set; }
    public uint? SponsorMemberId { get; set; }
    public string LastName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public DateOnly DateOfBirth { get; set; }
    public string? Email { get; set; }
    public GuestStatus Status { get; set; } = GuestStatus.Active;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Member? SponsorMember { get; set; }
    public ICollection<GuestAccessLogEntry> AccessLog { get; set; } = [];
}
