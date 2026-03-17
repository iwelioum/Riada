using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Employees;
using Riada.Application.UseCases.Employees;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> List(
        [FromQuery, Range(1, int.MaxValue)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        [FromQuery] uint? clubId = null,
        [FromQuery, StringLength(100)] string? search = null,
        [FromServices] ListEmployeesUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
        var response = await useCase.ExecuteAsync(page, pageSize, clubId, normalizedSearch, ct);
        return Ok(response);
    }

    [HttpGet("{id:int:min(1)}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetDetail(
        uint id,
        [FromServices] GetEmployeeDetailUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(id, ct);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "BillingOps")]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Create(
        [FromBody] CreateEmployeeRequest request,
        [FromServices] CreateEmployeeUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return CreatedAtAction(nameof(GetDetail), new { id = response.Id }, response);
    }

    [HttpPut("{id:int:min(1)}")]
    [Authorize(Policy = "BillingOps")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(
        uint id,
        [FromBody] UpdateEmployeeRequest request,
        [FromServices] UpdateEmployeeUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(id, request, ct);
        return Ok(response);
    }
}
