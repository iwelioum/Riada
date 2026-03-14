using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations.CourseScheduling;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");
        // Composite PK
        builder.HasKey(e => new { e.MemberId, e.SessionId });
        builder.Property(e => e.MemberId).HasColumnName("member_id");
        builder.Property(e => e.SessionId).HasColumnName("session_id");
        builder.Property(e => e.BookedAt).HasColumnName("booked_at").HasPrecision(3);
        builder.Property(e => e.Status).HasColumnName("status")
            .HasConversion(v => v.ToMySqlString(), v => EnumConverters.ToBookingStatus(v));

        builder.HasOne(e => e.Member).WithMany().HasForeignKey(e => e.MemberId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(e => e.Session).WithMany(s => s.Bookings).HasForeignKey(e => e.SessionId).OnDelete(DeleteBehavior.Cascade);
    }
}
