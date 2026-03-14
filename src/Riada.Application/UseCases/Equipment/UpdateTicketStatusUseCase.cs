using FluentValidation;
using Riada.Application.DTOs.Requests.Equipment;
using Riada.Application.DTOs.Responses.Equipment;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Equipment;

public class UpdateTicketStatusUseCase
{
    private readonly IMaintenanceTicketRepository _ticketRepository;
    private readonly IValidator<UpdateTicketStatusRequest> _validator;

    public UpdateTicketStatusUseCase(
        IMaintenanceTicketRepository ticketRepository,
        IValidator<UpdateTicketStatusRequest> validator)
    {
        _ticketRepository = ticketRepository;
        _validator = validator;
    }

    public async Task<MaintenanceTicketResponse> ExecuteAsync(
        uint ticketId,
        UpdateTicketStatusRequest request,
        CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var ticket = await _ticketRepository.GetByIdAsync(ticketId, ct)
            ?? throw new NotFoundException("MaintenanceTicket", ticketId);

        ticket.Status = Enum.Parse<MaintenanceTicketStatus>(request.Status);
        if (request.ResolvedAt.HasValue)
            ticket.ResolvedAt = request.ResolvedAt.Value;

        _ticketRepository.Update(ticket);
        await _ticketRepository.SaveChangesAsync(ct);

        return new MaintenanceTicketResponse(
            ticket.Id,
            ticket.EquipmentId,
            ticket.Priority.ToString(),
            ticket.ProblemDescription ?? "",
            ticket.Status.ToString(),
            ticket.CreatedAt,
            ticket.ResolvedAt);
    }
}
