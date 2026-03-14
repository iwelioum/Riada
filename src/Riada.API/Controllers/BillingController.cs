using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Riada.Application.DTOs.Requests.Billing;
using Riada.Application.UseCases.Billing;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "BillingOps")]
public class BillingController : ControllerBase
{
    [HttpPost("generate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> GenerateMonthlyInvoice(
        [FromBody] GenerateMonthlyInvoiceRequest request,
        [FromServices] GenerateMonthlyInvoiceUseCase useCase,
        CancellationToken ct)
    {
        var result = await useCase.ExecuteAsync(request, ct);
        return result.StartsWith("OK:") ? Ok(new { Message = result }) : BadRequest(new { Message = result });
    }

    [HttpGet("invoices/{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetInvoiceDetail(
        uint id,
        [FromServices] GetInvoiceDetailUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(id, ct);
        return Ok(response);
    }

    [HttpPost("payments")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> RecordPayment(
        [FromBody] RecordPaymentRequest request,
        [FromServices] RecordPaymentUseCase useCase,
        CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request, ct);
        return Ok(response);
    }
}
