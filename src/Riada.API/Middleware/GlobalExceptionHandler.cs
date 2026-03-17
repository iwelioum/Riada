using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Riada.Application.DTOs.Responses.Common;
using Riada.Domain.Exceptions;

namespace Riada.API.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
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
            await HandleExceptionAsync(context, ex, _environment.IsDevelopment());
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, bool isDevelopment)
    {
        context.Response.ContentType = "application/json";
        var internalErrorMessage = isDevelopment ? exception.Message : "An unexpected error occurred.";

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

            FluentValidation.ValidationException ex => (HttpStatusCode.BadRequest,
                new ErrorResponse("VALIDATION_ERROR", "Validation failed.",
                    ex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }))),

            ArgumentException ex => (HttpStatusCode.BadRequest,
                new ErrorResponse("INVALID_ARGUMENT", ex.Message)),

            DbUpdateException ex when TryMapMySqlException(
                ex.GetBaseException() as MySqlException,
                out var dbMapped) => dbMapped,

            MySqlException ex when TryMapMySqlException(ex, out var sqlMapped) => sqlMapped,

            _ => (HttpStatusCode.InternalServerError,
                new ErrorResponse("INTERNAL_ERROR", internalErrorMessage))
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

    private static bool TryMapMySqlException(
        MySqlException? ex,
        out (HttpStatusCode StatusCode, ErrorResponse Response) mapped)
    {
        mapped = default;
        if (ex is null)
            return false;

        if (ex.SqlState == "45000")
        {
            mapped = (
                HttpStatusCode.UnprocessableEntity,
                new ErrorResponse("TRIGGER_VIOLATION", ParseTriggerMessage(ex.Message)));
            return true;
        }

        if (ex.Number == 1062)
        {
            mapped = (
                HttpStatusCode.Conflict,
                new ErrorResponse("DUPLICATE_KEY", ParseDuplicateMessage(ex.Message)));
            return true;
        }

        if (ex.Number == 1452)
        {
            var (statusCode, message, code) = ParseForeignKeyViolation(ex.Message);
            mapped = (statusCode, new ErrorResponse(code, message));
            return true;
        }

        if (ex.Number is 1048 or 1265 or 1366)
        {
            mapped = (
                HttpStatusCode.BadRequest,
                new ErrorResponse("INVALID_INPUT", "Invalid value provided for one or more fields."));
            return true;
        }

        return false;
    }

    private static string ParseDuplicateMessage(string raw)
    {
        if (raw.Contains("bookings.PRIMARY", StringComparison.OrdinalIgnoreCase))
            return "Booking already exists for this member and session.";

        return "Duplicate key constraint violation.";
    }

    private static (HttpStatusCode StatusCode, string Message, string Code) ParseForeignKeyViolation(string raw)
    {
        if (raw.Contains("fk_bookings_member", StringComparison.OrdinalIgnoreCase))
            return (HttpStatusCode.NotFound, "Member not found for booking operation.", "MEMBER_NOT_FOUND");

        if (raw.Contains("fk_bookings_session", StringComparison.OrdinalIgnoreCase))
            return (HttpStatusCode.NotFound, "Session not found for booking operation.", "SESSION_NOT_FOUND");

        return (
            HttpStatusCode.UnprocessableEntity,
            "Referenced resource does not exist.",
            "REFERENCE_VIOLATION");
    }
}
