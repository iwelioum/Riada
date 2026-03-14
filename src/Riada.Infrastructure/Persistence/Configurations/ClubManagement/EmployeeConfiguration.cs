using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.ClubManagement;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
        builder.Property(e => e.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
        builder.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.Email).IsUnique();
        builder.Property(e => e.ClubId).HasColumnName("club_id");
        builder.Property(e => e.Role).HasColumnName("role")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToEmployeeRole(v));
        builder.Property(e => e.MonthlySalary).HasColumnName("monthly_salary").HasColumnType("decimal(10,2)");
        builder.Property(e => e.Qualifications).HasColumnName("qualifications").HasColumnType("text");
        builder.Property(e => e.HiredOn).HasColumnName("hired_on");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Club).WithMany(c => c.Employees).HasForeignKey(e => e.ClubId).OnDelete(DeleteBehavior.Restrict);
    }
}
