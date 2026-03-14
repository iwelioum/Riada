namespace Riada.Application.Services.EventHandlers.Membership;

using Riada.Domain.Events.Membership;
using System.Diagnostics;

/// <summary>
/// Domain event handler triggered when a new member is created.
/// Initiates auto-billing, sends welcome email, and performs setup tasks.
/// Demonstrates event-driven architecture and loose coupling in Clean Architecture.
/// </summary>
public class MemberCreatedEventHandler
{
    private readonly IAutoScalingBillingService _autoScalingBillingService;
    private readonly IEmailNotificationService _emailService;
    private readonly IAuditService _auditService;

    public MemberCreatedEventHandler(
        IAutoScalingBillingService autoScalingBillingService,
        IEmailNotificationService emailService,
        IAuditService auditService)
    {
        _autoScalingBillingService = autoScalingBillingService;
        _emailService = emailService;
        _auditService = auditService;
    }

    /// <summary>
    /// Handles the member creation event with all side effects
    /// </summary>
    public async Task Handle(MemberCreatedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            Debug.WriteLine($"Processing MemberCreatedEvent for Member {notification.MemberId}: {notification.FirstName} {notification.LastName}");

            // 1. Initialize auto-billing for the member
            await _autoScalingBillingService.InitializeAutoBillingAsync(
                notification.MemberId, cancellationToken);

            // 2. Send welcome email
            await _emailService.SendWelcomeEmailAsync(
                notification.Email,
                notification.FirstName,
                cancellationToken);

            // 3. Audit the event
            await _auditService.LogAsync(
                "Member.Created",
                notification.MemberId,
                notification.FirstName + " " + notification.LastName,
                cancellationToken);

            Debug.WriteLine($"MemberCreatedEvent handled successfully for Member {notification.MemberId}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error handling MemberCreatedEvent for Member {notification.MemberId}: {ex.Message}");
            throw;
        }
    }
}

/// <summary>
/// Placeholder for auto-billing service
/// </summary>
public interface IAutoScalingBillingService
{
    Task InitializeAutoBillingAsync(int memberId, CancellationToken cancellationToken);
}

/// <summary>
/// Placeholder for email service
/// </summary>
public interface IEmailNotificationService
{
    Task SendWelcomeEmailAsync(string email, string firstName, CancellationToken cancellationToken);
}

/// <summary>
/// Placeholder for audit service
/// </summary>
public interface IAuditService
{
    Task LogAsync(string action, int entityId, string description, CancellationToken cancellationToken);
}
