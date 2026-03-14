using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.CourseScheduling;

namespace Riada.Infrastructure.Persistence.Configurations.CourseScheduling;

public class ClassSessionConfiguration : IEntityTypeConfiguration<ClassSession>
{
    public void Configure(EntityTypeBuilder<ClassSession> builder)
    {
        builder.ToTable("class_sessions");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.CourseId).HasColumnName("course_id");
        builder.Property(e => e.InstructorId).HasColumnName("instructor_id");
        builder.Property(e => e.ClubId).HasColumnName("club_id");
        builder.Property(e => e.StartsAt).HasColumnName("starts_at").HasPrecision(3);
        builder.Property(e => e.DurationMinutes).HasColumnName("duration_minutes").HasColumnType("smallint unsigned");
        builder.Property(e => e.EnrolledCount).HasColumnName("enrolled_count").HasColumnType("smallint unsigned");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Course).WithMany(c => c.Sessions).HasForeignKey(e => e.CourseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.Instructor).WithMany().HasForeignKey(e => e.InstructorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.Club).WithMany().HasForeignKey(e => e.ClubId).OnDelete(DeleteBehavior.Restrict);
    }
}
