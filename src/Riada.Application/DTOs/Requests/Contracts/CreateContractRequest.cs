namespace Riada.Application.DTOs.Requests.Contracts;

public record CreateContractRequest(
    uint MemberId,
    uint PlanId,
    uint HomeClubId,
    string ContractType,
    DateOnly StartDate,
    DateOnly? EndDate);
