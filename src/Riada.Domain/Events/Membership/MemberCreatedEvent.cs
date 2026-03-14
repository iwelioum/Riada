namespace Riada.Domain.Events.Membership;

/// <summary>
/// Domain event triggered when a new member is created.
/// This event signals the start of the member lifecycle and triggers auto-billing initialization.
/// </summary>
public class MemberCreatedEvent : DomainEvent
{
    public int MemberId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }

    public MemberCreatedEvent() { }

    public MemberCreatedEvent(
        int memberId,
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        DateTime registrationDate)
    {
        AggregateId = memberId;
        MemberId = memberId;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PhoneNumber = phoneNumber;
        RegistrationDate = registrationDate;
    }
}
