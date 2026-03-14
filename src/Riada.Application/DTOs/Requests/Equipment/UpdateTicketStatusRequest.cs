namespace Riada.Application.DTOs.Requests.Equipment;

public record UpdateTicketStatusRequest(string Status, DateTime? ResolvedAt);
