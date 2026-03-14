namespace Riada.Application.DTOs.Responses.Access;

public record AccessCheckResponse(string Decision, string? DenialReason = null);
