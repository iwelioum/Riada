using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.Membership;

public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.ToTable("contracts");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.MemberId).HasColumnName("member_id");
        builder.Property(e => e.PlanId).HasColumnName("plan_id");
        builder.Property(e => e.HomeClubId).HasColumnName("home_club_id");
        builder.Property(e => e.StartDate).HasColumnName("start_date");
        builder.Property(e => e.EndDate).HasColumnName("end_date");
        builder.Property(e => e.ContractType).HasColumnName("contract_type")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToContractType(v));
        builder.Property(e => e.Status).HasColumnName("status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToContractStatus(v));
        builder.Property(e => e.CancelledOn).HasColumnName("cancelled_on");
        builder.Property(e => e.CancellationReason).HasColumnName("cancellation_reason").HasMaxLength(255);
        builder.Property(e => e.FreezeStartDate).HasColumnName("freeze_start_date");
        builder.Property(e => e.FreezeEndDate).HasColumnName("freeze_end_date");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        builder.HasOne(e => e.Member).WithMany(m => m.Contracts).HasForeignKey(e => e.MemberId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(e => e.Plan).WithMany(p => p.Contracts).HasForeignKey(e => e.PlanId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.HomeClub).WithMany().HasForeignKey(e => e.HomeClubId).OnDelete(DeleteBehavior.Restrict);
    }
}
