using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Billing;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.Billing;

public class InvoiceLineConfiguration : IEntityTypeConfiguration<InvoiceLine>
{
    public void Configure(EntityTypeBuilder<InvoiceLine> builder)
    {
        builder.ToTable("invoice_lines");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.InvoiceId).HasColumnName("invoice_id");
        builder.Property(e => e.Description).HasColumnName("description").HasMaxLength(255).IsRequired();
        builder.Property(e => e.LineType).HasColumnName("line_type")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToInvoiceLineType(v));
        builder.Property(e => e.PlanId).HasColumnName("plan_id");
        builder.Property(e => e.OptionId).HasColumnName("option_id");
        builder.Property(e => e.Quantity).HasColumnName("quantity");
        builder.Property(e => e.UnitPriceExclTax).HasColumnName("unit_price_excl_tax").HasColumnType("decimal(10,2)");
        builder.Property(e => e.VatRate).HasColumnName("vat_rate").HasColumnType("decimal(5,4)");

        // ⚠️ GENERATED COLUMNS
        builder.Property(e => e.LineAmountExclTax).HasColumnName("line_amount_excl_tax").HasColumnType("decimal(10,2)")
            .ValueGeneratedOnAddOrUpdate();
        builder.Property(e => e.LineAmountInclTax).HasColumnName("line_amount_incl_tax").HasColumnType("decimal(10,2)")
            .ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Invoice).WithMany(i => i.Lines).HasForeignKey(e => e.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(e => e.Plan).WithMany().HasForeignKey(e => e.PlanId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.Option).WithMany().HasForeignKey(e => e.OptionId).OnDelete(DeleteBehavior.Restrict);
    }
}
