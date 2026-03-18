using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Interfaces.Repositories;
using Riada.Infrastructure.Persistence;

namespace Riada.Infrastructure.Repositories;

public class ShiftRepository : IShiftRepository
{
    private readonly RiadaDbContext _context;

    public ShiftRepository(RiadaDbContext context) => _context = context;

    public async Task<IReadOnlyList<Shift>> GetWeekAsync(uint? clubId, DateOnly weekStart, CancellationToken ct = default)
    {
        var weekEnd = weekStart.AddDays(7);
        var query = _context.Shifts.AsNoTracking()
            .Include(s => s.Employee)
            .Where(s => s.Date >= weekStart && s.Date < weekEnd);

        if (clubId.HasValue)
        {
            query = query.Where(s => s.ClubId == clubId.Value);
        }

        return await query
            .OrderBy(s => s.Date)
            .ThenBy(s => s.Employee.LastName)
            .ToListAsync(ct);
    }

    public async Task<Shift> CreateAsync(Shift shift, CancellationToken ct = default)
    {
        _context.Shifts.Add(shift);
        await _context.SaveChangesAsync(ct);
        await _context.Entry(shift).Reference(s => s.Employee).LoadAsync(ct);
        return shift;
    }

    public async Task<bool> DeleteAsync(uint id, CancellationToken ct = default)
    {
        var shift = await _context.Shifts.FindAsync([id], ct);
        if (shift is null) return false;
        _context.Shifts.Remove(shift);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}
