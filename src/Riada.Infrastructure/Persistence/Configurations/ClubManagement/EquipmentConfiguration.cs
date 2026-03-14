using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.ClubManagement;

public class EquipmentConfiguration : IEntityTypeConfiguration<Equipment>
{
    public void Configure(EntityTypeBuilder<Equipment> builder)
    {
        builder.ToTable("equipment");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(e => e.EquipmentType).HasColumnName("equipment_type").HasMaxLength(50).IsRequired();
        builder.Property(e => e.ClubId).HasColumnName("club_id");
        builder.Property(e => e.Brand).HasColumnName("brand").HasMaxLength(100);
        builder.Property(e => e.Model).HasColumnName("model").HasMaxLength(100);
        builder.Property(e => e.AcquisitionYear).HasColumnName("acquisition_year").HasColumnType("year");
        builder.Property(e => e.Status).HasColumnName("status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToEquipmentStatus(v));
        builder.Property(e => e.PurchaseCost).HasColumnName("purchase_cost").HasColumnType("decimal(10,2)");
        builder.Property(e => e.UsageHours).HasColumnName("usage_hours");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Club).WithMany(c => c.Equipment).HasForeignKey(e => e.ClubId).OnDelete(DeleteBehavior.Restrict);
    }
}
