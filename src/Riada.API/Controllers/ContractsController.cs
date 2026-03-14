using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Contracts;
using Riada.Application.UseCases.Contracts;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractsController : ControllerBase
{
    [HttpGet("{id:uint}")]
    public async Task<IActionResult> GetDetail(
        uint id,
        [FromServices] GetContractDetailUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(id, ct);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateContractRequest request,
        [FromServices] CreateContractUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return CreatedAtAction(nameof(GetDetail), new { id = response.Id }, response);
    }

    [HttpPost("{id:int}/freeze")]
    [Authorize(Policy = "DataProtection")]
    public async Task<IActionResult> Freeze(
        uint id,
        [FromBody] FreezeContractRequest request,
        [FromServices] FreezeContractUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request with { ContractId = id }, ct);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("{id:int}/renew")]
    [Authorize(Policy = "DataProtection")]
    public async Task<IActionResult> Renew(
        uint id,
        [FromServices] RenewContractUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(new RenewContractRequest(id), ct);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
