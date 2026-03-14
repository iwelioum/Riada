using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.CourseScheduling;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("courses");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.CourseName).HasColumnName("course_name").HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.CourseName).IsUnique();
        builder.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
        builder.Property(e => e.DifficultyLevel).HasColumnName("difficulty_level")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToDifficultyLevel(v));
        builder.Property(e => e.DurationMinutes).HasColumnName("duration_minutes").HasColumnType("smallint unsigned");
        builder.Property(e => e.MaxCapacity).HasColumnName("max_capacity").HasColumnType("smallint unsigned");
        builder.Property(e => e.EstimatedCalories).HasColumnName("estimated_calories");
        builder.Property(e => e.ActivityType).HasColumnName("activity_type")
            .HasConversion(v => v == null ? null : v.Value.ToMySqlString(), v => v == null ? null : EnumConverters.ToActivityType(v));
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();
    }
}
