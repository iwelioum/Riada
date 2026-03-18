using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Riada.Application.DTOs.Requests.Billing;
using Riada.Application.DTOs.Responses.Billing;
using Riada.Application.UseCases.Billing;
using Riada.Infrastructure.Persistence;

namespace Riada.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "BillingOps")]
public class BillingController : ControllerBase
{
    [HttpGet("invoices")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> ListInvoices(
        [FromServices] RiadaDbContext context,
        CancellationToken ct)
    {
        var invoices = await context.Invoices
            .AsNoTracking()
            .OrderByDescending(i => i.IssuedOn)
            .Select(i => new InvoiceSummaryResponse(
                i.Id,
                i.InvoiceNumber,
                i.IssuedOn,
                i.DueDate,
                i.AmountInclTax,
                i.AmountPaid,
                i.BalanceDue,
                i.Status.ToString(),
                i.ContractId,
                i.Contract != null ? i.Contract.MemberId : null,
                i.Contract != null && i.Contract.Member != null
                    ? i.Contract.Member.FirstName + " " + i.Contract.Member.LastName
                    : null))
            .ToListAsync(ct);

        return Ok(invoices);
    }

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
