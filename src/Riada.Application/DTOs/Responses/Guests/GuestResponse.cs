namespace Riada.Application.DTOs.Responses.Guests;

public record GuestResponse(
    uint Id,
    string LastName,
    string FirstName,
    DateOnly DateOfBirth,
    string Status,
    uint? SponsorMemberId,
    string? SponsorName);
