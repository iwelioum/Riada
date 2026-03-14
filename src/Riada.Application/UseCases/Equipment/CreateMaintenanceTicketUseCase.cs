using FluentValidation;
using Riada.Application.DTOs.Requests.Equipment;
using Riada.Application.DTOs.Responses.Equipment;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Equipment;

public class CreateMaintenanceTicketUseCase
{
    private readonly IMaintenanceTicketRepository _ticketRepository;
    private readonly IEquipmentRepository _equipmentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<CreateMaintenanceTicketRequest> _validator;

    public CreateMaintenanceTicketUseCase(
        IMaintenanceTicketRepository ticketRepository,
        IEquipmentRepository equipmentRepository,
        IUnitOfWork unitOfWork,
        IValidator<CreateMaintenanceTicketRequest> validator)
    {
        _ticketRepository = ticketRepository;
        _equipmentRepository = equipmentRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<MaintenanceTicketResponse> ExecuteAsync(
        CreateMaintenanceTicketRequest request,
        CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var equipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId, ct)
            ?? throw new NotFoundException("Equipment", request.EquipmentId);

        var ticket = new MaintenanceTicket
        {
            EquipmentId = request.EquipmentId,
            Priority = Enum.Parse<MaintenancePriority>(request.Priority),
            ProblemDescription = request.Description,
            Status = MaintenanceTicketStatus.Reported,
            ReportedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _ticketRepository.AddAsync(ticket, ct);
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
