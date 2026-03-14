namespace Riada.Application.DTOs.Responses.Common;

public record ErrorResponse(string Code, string Message, object? Details = null);
