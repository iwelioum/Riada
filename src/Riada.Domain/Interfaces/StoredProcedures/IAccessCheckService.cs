using Riada.Domain.Enums;

namespace Riada.Domain.Interfaces.StoredProcedures;

public interface IAccessCheckService
{
    /// <summary>Calls sp_CheckAccess</summary>
    Task<AccessDecision> CheckMemberAccessAsync(uint memberId, uint clubId, CancellationToken ct = default);

    /// <summary>Calls sp_CheckAccessGuest</summary>
    Task<AccessDecision> CheckGuestAccessAsync(uint guestId, uint companionMemberId, uint clubId, CancellationToken ct = default);
}
