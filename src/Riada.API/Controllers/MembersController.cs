using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Members;
using Riada.Application.UseCases.Members;
using Riada.Domain.Enums;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MembersController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromServices] ListMembersUseCase useCase = default!,
        CancellationToken ct = default)
    {
        MemberStatus? statusFilter = status is not null
            ? Enum.Parse<MemberStatus>(status, ignoreCase: true)
            : null;

        var response = await useCase.ExecuteAsync(page, pageSize, statusFilter, search, ct);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetDetail(
        uint id,
        [FromServices] GetMemberDetailUseCase useCase,
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
        [FromBody] CreateMemberRequest request,
        [FromServices] CreateMemberUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return CreatedAtAction(nameof(GetDetail), new { id = response.Id }, response);
    }

    [HttpPut("{id:int:min(1)}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Update(
        uint id,
        [FromBody] UpdateMemberRequest request,
        [FromServices] UpdateMemberUseCase useCase = default!,
        CancellationToken ct = default)
    {
        var response = await useCase.ExecuteAsync(id, request, ct);
        return Ok(response);
    }

    [HttpDelete("{id:int}/gdpr")]
    [Authorize(Policy = "DataProtection")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Anonymize(
        uint id,
        [FromBody] AnonymizeMemberRequest request,
        [FromServices] AnonymizeMemberUseCase useCase,
        CancellationToken ct)
    {
        var result = await useCase.ExecuteAsync(request with { MemberId = id }, ct);
        return result.StartsWith("OK:") ? Ok(new { Message = result }) : BadRequest(new { Message = result });
    }
}
