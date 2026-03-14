namespace Riada.Application.DTOs.Responses.Contracts;

public record ContractResponse(
    uint Id,
    string PlanName,
    string HomeClub,
    DateOnly StartDate,
    DateOnly? EndDate,
    string ContractType,
    string Status,
    DateOnly? FreezeStartDate,
    DateOnly? FreezeEndDate,
    IReadOnlyList<string> ActiveOptions);
