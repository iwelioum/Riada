using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Membership;

namespace Riada.Infrastructure.Persistence.Configurations.Membership;

public class ServiceOptionConfiguration : IEntityTypeConfiguration<ServiceOption>
{
    public void Configure(EntityTypeBuilder<ServiceOption> builder)
    {
        builder.ToTable("service_options");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.OptionName).HasColumnName("option_name").HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.OptionName).IsUnique();
        builder.Property(e => e.MonthlyPrice).HasColumnName("monthly_price").HasColumnType("decimal(10,2)");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();
    }
}
