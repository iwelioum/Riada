using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Billing;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.Billing;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.InvoiceId).HasColumnName("invoice_id");
        builder.Property(e => e.PaidAt).HasColumnName("paid_at").HasPrecision(3);
        builder.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(10,2)");
        builder.Property(e => e.Status).HasColumnName("status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToPaymentStatus(v));
        builder.Property(e => e.PaymentMethod).HasColumnName("payment_method")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToPaymentMethod(v));
        builder.Property(e => e.TransactionReference).HasColumnName("transaction_reference").HasMaxLength(100);
        builder.Property(e => e.ErrorCode).HasColumnName("error_code").HasMaxLength(50);
        builder.Property(e => e.AttemptCount).HasColumnName("attempt_count");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Invoice).WithMany(i => i.Payments).HasForeignKey(e => e.InvoiceId).OnDelete(DeleteBehavior.Restrict);
    }
}
