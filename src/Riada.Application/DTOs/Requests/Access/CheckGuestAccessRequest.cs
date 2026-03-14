namespace Riada.Application.DTOs.Requests.Access;

public record CheckGuestAccessRequest(uint GuestId, uint CompanionMemberId, uint ClubId);
