using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Compliance;

namespace Riada.Infrastructure.Persistence.Configurations.Compliance;

public class AuditGdprConfiguration : IEntityTypeConfiguration<AuditGdpr>
{
    public void Configure(EntityTypeBuilder<AuditGdpr> builder)
    {
        builder.ToTable("audit_gdpr");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id").HasColumnType("bigint unsigned");
        builder.Property(e => e.MemberId).HasColumnName("member_id");
        builder.Property(e => e.AnonymizedAt).HasColumnName("anonymized_at").HasPrecision(3);
        builder.Property(e => e.RequestedBy).HasColumnName("requested_by").HasMaxLength(100).IsRequired();

        builder.HasOne(e => e.Member).WithMany().HasForeignKey(e => e.MemberId).OnDelete(DeleteBehavior.Restrict);
    }
}
