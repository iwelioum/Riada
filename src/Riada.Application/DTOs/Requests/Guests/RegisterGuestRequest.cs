namespace Riada.Application.DTOs.Requests.Guests;

public record RegisterGuestRequest(
    uint SponsorMemberId,
    string LastName,
    string FirstName,
    DateOnly DateOfBirth,
    string? Email);
