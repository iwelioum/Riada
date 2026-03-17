using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.ClubManagement;
using Riada.Infrastructure.Persistence.Configurations;

namespace Riada.Infrastructure.Persistence.Configurations.ClubManagement;

public class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> builder)
    {
        builder.ToTable("shifts");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.EmployeeId).HasColumnName("employee_id");
        builder.Property(s => s.ClubId).HasColumnName("club_id");
        builder.Property(s => s.Date).HasColumnName("date");
        builder.Property(s => s.StartTime).HasColumnName("start_time");
        builder.Property(s => s.EndTime).HasColumnName("end_time");
        builder.Property(s => s.ShiftType).HasColumnName("shift_type")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToShiftType(v))
            .HasMaxLength(20);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();

        builder.HasOne(s => s.Employee).WithMany().HasForeignKey(s => s.EmployeeId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(s => s.Club).WithMany().HasForeignKey(s => s.ClubId).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.EmployeeId, s.Date });
        builder.HasIndex(s => new { s.ClubId, s.Date });
    }
}
