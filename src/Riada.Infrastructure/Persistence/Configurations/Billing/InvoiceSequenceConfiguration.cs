using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Billing;

namespace Riada.Infrastructure.Persistence.Configurations.Billing;

public class InvoiceSequenceConfiguration : IEntityTypeConfiguration<InvoiceSequence>
{
    public void Configure(EntityTypeBuilder<InvoiceSequence> builder)
    {
        builder.ToTable("invoice_sequences");
        builder.HasKey(e => e.Year);
        builder.Property(e => e.Year).HasColumnName("year").HasColumnType("year");
        builder.Property(e => e.LastNumber).HasColumnName("last_number");
    }
}
