using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Membership;

namespace Riada.Infrastructure.Persistence.Configurations.Membership;

public class SubscriptionPlanOptionConfiguration : IEntityTypeConfiguration<SubscriptionPlanOption>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlanOption> builder)
    {
        builder.ToTable("subscription_plan_options");
        builder.HasKey(e => new { e.PlanId, e.OptionId });
        builder.Property(e => e.PlanId).HasColumnName("plan_id");
        builder.Property(e => e.OptionId).HasColumnName("option_id");

        builder.HasOne(e => e.Plan).WithMany(p => p.PlanOptions).HasForeignKey(e => e.PlanId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(e => e.Option).WithMany(o => o.PlanOptions).HasForeignKey(e => e.OptionId).OnDelete(DeleteBehavior.Restrict);
    }
}
