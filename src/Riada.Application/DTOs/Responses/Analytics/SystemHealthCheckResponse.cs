namespace Riada.Application.DTOs.Responses.Analytics;

public record SystemHealthCheckResponse(bool IsHealthy, string Status, int TotalMembers, int ActiveContracts, int PendingInvoices);
