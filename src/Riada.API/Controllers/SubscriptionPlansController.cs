using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Riada.Infrastructure.Persistence;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/plans")]
[Authorize]
public class SubscriptionPlansController : ControllerBase
{
    private readonly RiadaDbContext _context;

    public SubscriptionPlansController(RiadaDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var plans = await _context.SubscriptionPlans
            .AsNoTracking()
            .Select(p => new
            {
                p.Id,
                p.PlanName,
                p.BasePrice,
                p.CommitmentMonths,
                p.EnrollmentFee,
                p.LimitedClubAccess,
                p.DuoPassAllowed
            })
            .ToListAsync(ct);

        return Ok(plans);
    }

    [HttpGet("{id:int}/options")]
    public async Task<IActionResult> GetPlanOptions(uint id, CancellationToken ct)
    {
        var options = await _context.SubscriptionPlanOptions
            .AsNoTracking()
            .Where(spo => spo.PlanId == id)
            .Select(spo => new
            {
                spo.Option.Id,
                spo.Option.OptionName,
                spo.Option.MonthlyPrice
            })
            .ToListAsync(ct);

        return Ok(options);
    }
}
