using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.AccessControl;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.AccessControl;

public class AccessLogConfiguration : IEntityTypeConfiguration<AccessLogEntry>
{
    public void Configure(EntityTypeBuilder<AccessLogEntry> builder)
    {
        builder.ToTable("access_log");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id").HasColumnType("bigint unsigned");
        builder.Property(e => e.MemberId).HasColumnName("member_id");
        builder.Property(e => e.ClubId).HasColumnName("club_id");
        builder.Property(e => e.AccessedAt).HasColumnName("accessed_at").HasPrecision(3);
        builder.Property(e => e.AccessStatus).HasColumnName("access_status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToAccessDecision(v));
        builder.Property(e => e.DenialReason).HasColumnName("denial_reason").HasMaxLength(255);

        builder.HasOne(e => e.Member).WithMany().HasForeignKey(e => e.MemberId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(e => e.Club).WithMany().HasForeignKey(e => e.ClubId).OnDelete(DeleteBehavior.Restrict);
    }
}
