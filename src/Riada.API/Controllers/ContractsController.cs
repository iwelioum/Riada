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
    [HttpGet("{id:int:min(1)}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetDetail(
        uint id,
        [FromServices] GetContractDetailUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(id, ct);
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
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
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
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
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Renew(
        uint id,
        [FromServices] RenewContractUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(new RenewContractRequest(id), ct);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
