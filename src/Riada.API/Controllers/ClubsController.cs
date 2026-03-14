using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClubsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromServices] IClubRepository clubRepository,
        CancellationToken ct)
    {
        var clubs = await clubRepository.GetAllAsync(ct);
        return Ok(clubs.Select(c => new
        {
            c.Id,
            c.Name,
            c.AddressCity,
            OperationalStatus = c.OperationalStatus.ToString(),
            c.IsOpen247
        }));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDashboard(
        uint id,
        [FromServices] IClubRepository clubRepository,
        CancellationToken ct)
    {
        var club = await clubRepository.GetWithEquipmentAsync(id, ct);
        if (club is null) return NotFound();

        return Ok(new
        {
            club.Id,
            club.Name,
            club.AddressStreet,
            club.AddressCity,
            club.AddressPostalCode,
            OperationalStatus = club.OperationalStatus.ToString(),
            EmployeeCount = club.Employees.Count,
            EquipmentCount = club.Equipment.Count
        });
    }
}
