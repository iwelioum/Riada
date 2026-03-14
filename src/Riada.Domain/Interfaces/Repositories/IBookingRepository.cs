using Riada.Domain.Entities.CourseScheduling;

namespace Riada.Domain.Interfaces.Repositories;

public interface IBookingRepository : IGenericRepository<Booking>
{
    Task<Booking?> GetByCompositeKeyAsync(uint memberId, uint sessionId, CancellationToken ct = default);
    void UpdateBooking(Booking booking);
}
