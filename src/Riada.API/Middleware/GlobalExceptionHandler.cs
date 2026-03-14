using System.Net;
using System.Text.Json;
using Riada.Application.DTOs.Responses.Common;
using Riada.Domain.Exceptions;

namespace Riada.API.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, response) = exception switch
        {
            NotFoundException ex => (HttpStatusCode.NotFound,
                new ErrorResponse(ex.Code, ex.Message)),

            AccessDeniedException ex => (HttpStatusCode.Forbidden,
                new ErrorResponse(ex.Code, ex.Message)),

            BusinessRuleException ex => (HttpStatusCode.UnprocessableEntity,
                new ErrorResponse(ex.Code, ex.Message)),

            ConflictException ex => (HttpStatusCode.Conflict,
                new ErrorResponse(ex.Code, ex.Message)),

            // MySQL trigger SIGNAL (SQLSTATE 45000) comes as MySqlException
            MySqlConnector.MySqlException ex when ex.SqlState == "45000" => (
                HttpStatusCode.UnprocessableEntity,
                new ErrorResponse("TRIGGER_VIOLATION", ParseTriggerMessage(ex.Message))),

            FluentValidation.ValidationException ex => (HttpStatusCode.BadRequest,
                new ErrorResponse("VALIDATION_ERROR", "Validation failed.",
                    ex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }))),

            _ => (HttpStatusCode.InternalServerError,
                new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred."))
        };

        context.Response.StatusCode = (int)statusCode;
        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }

    /// <summary>
    /// Parses trigger error messages like "[TRG][payments] Reason: ... Value: ..."
    /// </summary>
    private static string ParseTriggerMessage(string raw)
    {
        var reasonIdx = raw.IndexOf("Reason:", StringComparison.OrdinalIgnoreCase);
        return reasonIdx >= 0 ? raw[reasonIdx..] : raw;
    }
}
