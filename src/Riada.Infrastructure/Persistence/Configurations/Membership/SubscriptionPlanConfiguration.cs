using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Membership;

namespace Riada.Infrastructure.Persistence.Configurations.Membership;

public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.ToTable("subscription_plans");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.PlanName).HasColumnName("plan_name").HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.PlanName).IsUnique();
        builder.Property(e => e.BasePrice).HasColumnName("base_price").HasColumnType("decimal(10,2)");
        builder.Property(e => e.CommitmentMonths).HasColumnName("commitment_months");
        builder.Property(e => e.EnrollmentFee).HasColumnName("enrollment_fee").HasColumnType("decimal(10,2)");
        builder.Property(e => e.LimitedClubAccess).HasColumnName("limited_club_access");
        builder.Property(e => e.DuoPassAllowed).HasColumnName("duo_pass_allowed");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();
    }
}
