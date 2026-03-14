namespace Riada.Domain.Interfaces.StoredProcedures;

public interface IGdprService
{
    /// <summary>Calls sp_AnonymizeMember</summary>
    Task<string> AnonymizeMemberAsync(uint memberId, string requestedBy, CancellationToken ct = default);
}
