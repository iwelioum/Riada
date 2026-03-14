using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.ClubManagement;

public class ClubConfiguration : IEntityTypeConfiguration<Club>
{
    public void Configure(EntityTypeBuilder<Club> builder)
    {
        builder.ToTable("clubs");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(e => e.AddressStreet).HasColumnName("address_street").HasMaxLength(255).IsRequired();
        builder.Property(e => e.AddressCity).HasColumnName("address_city").HasMaxLength(100).IsRequired();
        builder.Property(e => e.AddressPostalCode).HasColumnName("address_postal_code").HasMaxLength(10).IsRequired();
        builder.Property(e => e.Country).HasColumnName("country").HasMaxLength(50).HasDefaultValue("Belgium");
        builder.Property(e => e.IsOpen247).HasColumnName("is_open_24_7").HasDefaultValue(true);
        builder.Property(e => e.OpenedOn).HasColumnName("opened_on");

        builder.Property(e => e.OperationalStatus)
            .HasColumnName("operational_status")
            .HasConversion(
                v => v.ToMySqlString(),
                v => EnumConverters.ToClubOperationalStatus(v));

        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();
    }
}
