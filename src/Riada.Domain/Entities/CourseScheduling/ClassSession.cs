using Riada.Domain.Entities.ClubManagement;

namespace Riada.Domain.Entities.CourseScheduling;

public class ClassSession
{
    public uint Id { get; set; }
    public uint CourseId { get; set; }
    public uint InstructorId { get; set; }
    public uint ClubId { get; set; }
    public DateTime StartsAt { get; set; }
    public ushort DurationMinutes { get; set; }
    public ushort EnrolledCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Course Course { get; set; } = null!;
    public Employee Instructor { get; set; } = null!;
    public Club Club { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = [];
}
