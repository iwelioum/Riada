using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.AccessControl;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.AccessControl;

public class GuestAccessLogConfiguration : IEntityTypeConfiguration<GuestAccessLogEntry>
{
    public void Configure(EntityTypeBuilder<GuestAccessLogEntry> builder)
    {
        builder.ToTable("guest_access_log");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id").HasColumnType("bigint unsigned");
        builder.Property(e => e.GuestId).HasColumnName("guest_id");
        builder.Property(e => e.CompanionMemberId).HasColumnName("companion_member_id");
        builder.Property(e => e.ClubId).HasColumnName("club_id");
        builder.Property(e => e.AccessedAt).HasColumnName("accessed_at").HasPrecision(3);
        builder.Property(e => e.AccessStatus).HasColumnName("access_status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToAccessDecision(v));
        builder.Property(e => e.DenialReason).HasColumnName("denial_reason").HasMaxLength(255);

        builder.HasOne(e => e.Guest).WithMany(g => g.AccessLog).HasForeignKey(e => e.GuestId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.CompanionMember).WithMany().HasForeignKey(e => e.CompanionMemberId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(e => e.Club).WithMany().HasForeignKey(e => e.ClubId).OnDelete(DeleteBehavior.Restrict);
    }
}
