using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.Membership;

public class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.ToTable("members");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
        builder.Property(e => e.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
        builder.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.Email).IsUnique().HasDatabaseName("uq_members_email");
        builder.Property(e => e.Gender).HasColumnName("gender")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToGender(v));
        builder.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
        builder.Property(e => e.Nationality).HasColumnName("nationality").HasMaxLength(50).HasDefaultValue("Belgian");
        builder.Property(e => e.MobilePhone).HasColumnName("mobile_phone").HasMaxLength(20);
        builder.Property(e => e.AddressStreet).HasColumnName("address_street").HasMaxLength(255);
        builder.Property(e => e.AddressCity).HasColumnName("address_city").HasMaxLength(100);
        builder.Property(e => e.AddressPostalCode).HasColumnName("address_postal_code").HasMaxLength(10);
        builder.Property(e => e.Status).HasColumnName("status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToMemberStatus(v));
        builder.Property(e => e.ReferralMemberId).HasColumnName("referral_member_id");
        builder.Property(e => e.PrimaryGoal).HasColumnName("primary_goal")
            .HasConversion(v => v == null ? null : v.Value.ToMySqlString(), v => v == null ? null : EnumConverters.ToPrimaryGoal(v));
        builder.Property(e => e.AcquisitionSource).HasColumnName("acquisition_source")
            .HasConversion(v => v == null ? null : v.Value.ToMySqlString(), v => v == null ? null : EnumConverters.ToAcquisitionSource(v));
        builder.Property(e => e.MedicalCertificateProvided).HasColumnName("medical_certificate_provided");
        builder.Property(e => e.GdprConsentAt).HasColumnName("gdpr_consent_at").HasPrecision(3);
        builder.Property(e => e.MarketingConsent).HasColumnName("marketing_consent");
        builder.Property(e => e.LastVisitDate).HasColumnName("last_visit_date");
        builder.Property(e => e.TotalVisits).HasColumnName("total_visits");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasPrecision(3).ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasPrecision(3).ValueGeneratedOnAddOrUpdate();

        // Self-referencing FK for referral
        builder.HasOne(e => e.ReferralMember)
            .WithMany(e => e.ReferredMembers)
            .HasForeignKey(e => e.ReferralMemberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
