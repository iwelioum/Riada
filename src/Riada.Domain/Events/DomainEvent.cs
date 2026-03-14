namespace Riada.Domain.Events;

/// <summary>
/// Base class for all domain events in the Riada system.
/// Implements event-driven architecture pattern for loose coupling between aggregates.
/// </summary>
public abstract class DomainEvent
{
    /// <summary>
    /// Unique identifier for this event instance
    /// </summary>
    public Guid EventId { get; } = Guid.NewGuid();

    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    public DateTime OccurredAt { get; } = DateTime.UtcNow;

    /// <summary>
    /// Aggregate root ID that triggered this event
    /// </summary>
    public int AggregateId { get; protected set; }

    /// <summary>
    /// Aggregate type name (for audit/logging)
    /// </summary>
    public string AggregateType => GetType().Name.Replace("Event", string.Empty);

    /// <summary>
    /// Version of the event schema (for future compatibility)
    /// </summary>
    public int Version { get; protected set; } = 1;
}
