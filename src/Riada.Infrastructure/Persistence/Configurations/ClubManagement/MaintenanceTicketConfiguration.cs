using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.ClubManagement;

public class MaintenanceTicketConfiguration : IEntityTypeConfiguration<MaintenanceTicket>
{
    public void Configure(EntityTypeBuilder<MaintenanceTicket> builder)
    {
        builder.ToTable("maintenance_tickets");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.EquipmentId).HasColumnName("equipment_id");
        builder.Property(e => e.TechnicianId).HasColumnName("technician_id");
        builder.Property(e => e.MaintenanceType).HasColumnName("maintenance_type")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToMaintenanceType(v));
        builder.Property(e => e.Status).HasColumnName("status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToMaintenanceTicketStatus(v));
        builder.Property(e => e.Priority).HasColumnName("priority")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToMaintenancePriority(v));
        builder.Property(e => e.ReportedAt).HasColumnName("reported_at").HasPrecision(3);
        builder.Property(e => e.ResolvedAt).HasColumnName("resolved_at").HasPrecision(3);
        builder.Property(e => e.ProblemDescription).HasColumnName("problem_description").HasColumnType("text");
        builder.Property(e => e.RepairCost).HasColumnName("repair_cost").HasColumnType("decimal(10,2)");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Equipment).WithMany(eq => eq.MaintenanceTickets).HasForeignKey(e => e.EquipmentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(e => e.Technician).WithMany().HasForeignKey(e => e.TechnicianId).OnDelete(DeleteBehavior.SetNull);
    }
}
