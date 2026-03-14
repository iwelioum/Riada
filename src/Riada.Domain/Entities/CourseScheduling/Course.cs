using Riada.Domain.Enums;

namespace Riada.Domain.Entities.CourseScheduling;

public class Course
{
    public uint Id { get; set; }
    public string CourseName { get; set; } = null!;
    public string? Description { get; set; }
    public DifficultyLevel DifficultyLevel { get; set; } = DifficultyLevel.AllLevels;
    public ushort DurationMinutes { get; set; }
    public ushort MaxCapacity { get; set; } = 20;
    public uint? EstimatedCalories { get; set; }
    public ActivityType? ActivityType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<ClassSession> Sessions { get; set; } = [];
}
