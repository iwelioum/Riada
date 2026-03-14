using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class BookingRepository : GenericRepository<Booking>, IBookingRepository
{
    public BookingRepository(RiadaDbContext context) : base(context) { }

    public async Task<Booking?> GetByCompositeKeyAsync(
        uint memberId,
        uint sessionId,
        CancellationToken ct = default)
    {
        return await DbSet.FirstOrDefaultAsync(
            b => b.MemberId == memberId && b.SessionId == sessionId, ct);
    }

    public void UpdateBooking(Booking booking)
    {
        Update(booking);
    }
}
