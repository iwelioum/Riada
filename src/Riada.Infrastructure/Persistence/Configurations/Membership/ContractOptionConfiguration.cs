using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Membership;

namespace Riada.Infrastructure.Persistence.Configurations.Membership;

public class ContractOptionConfiguration : IEntityTypeConfiguration<ContractOption>
{
    public void Configure(EntityTypeBuilder<ContractOption> builder)
    {
        builder.ToTable("contract_options");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.ContractId).HasColumnName("contract_id");
        builder.Property(e => e.OptionId).HasColumnName("option_id");
        builder.Property(e => e.AddedOn).HasColumnName("added_on");
        builder.Property(e => e.RemovedOn).HasColumnName("removed_on");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Contract).WithMany(c => c.ContractOptions).HasForeignKey(e => e.ContractId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(e => e.Option).WithMany(o => o.ContractOptions).HasForeignKey(e => e.OptionId).OnDelete(DeleteBehavior.Restrict);
    }
}
