using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Billing;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.Billing;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.ContractId).HasColumnName("contract_id");
        builder.Property(e => e.InvoiceNumber).HasColumnName("invoice_number").HasMaxLength(50).IsRequired();
        builder.HasIndex(e => e.InvoiceNumber).IsUnique();
        builder.Property(e => e.IssuedOn).HasColumnName("issued_on");
        builder.Property(e => e.DueDate).HasColumnName("due_date");
        builder.Property(e => e.BillingPeriodStart).HasColumnName("billing_period_start");
        builder.Property(e => e.BillingPeriodEnd).HasColumnName("billing_period_end");
        builder.Property(e => e.AmountExclTax).HasColumnName("amount_excl_tax").HasColumnType("decimal(10,2)");
        builder.Property(e => e.VatRate).HasColumnName("vat_rate").HasColumnType("decimal(5,4)");

        // ⚠️ GENERATED COLUMNS — MySQL computes these, EF must never write them
        builder.Property(e => e.VatAmount).HasColumnName("vat_amount").HasColumnType("decimal(10,2)")
            .ValueGeneratedOnAddOrUpdate();
        builder.Property(e => e.AmountInclTax).HasColumnName("amount_incl_tax").HasColumnType("decimal(10,2)")
            .ValueGeneratedOnAddOrUpdate();
        builder.Property(e => e.BalanceDue).HasColumnName("balance_due").HasColumnType("decimal(10,2)")
            .ValueGeneratedOnAddOrUpdate();

        builder.Property(e => e.Status).HasColumnName("status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToInvoiceStatus(v));
        builder.Property(e => e.AmountPaid).HasColumnName("amount_paid").HasColumnType("decimal(10,2)");
        builder.Property(e => e.PaidInFullAt).HasColumnName("paid_in_full_at").HasPrecision(3);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Contract).WithMany(c => c.Invoices).HasForeignKey(e => e.ContractId).OnDelete(DeleteBehavior.SetNull);
    }
}
