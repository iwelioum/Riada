using Riada.Domain.Enums;
using Riada.Domain.Entities.Membership;

namespace Riada.Domain.Entities.CourseScheduling;

/// <summary>
/// Composite PK (MemberId, SessionId).
/// </summary>
public class Booking
{
    public uint MemberId { get; set; }
    public uint SessionId { get; set; }
    public DateTime BookedAt { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;

    // Navigation
    public Member Member { get; set; } = null!;
    public ClassSession Session { get; set; } = null!;
}
