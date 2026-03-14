namespace Riada.Application.DTOs.Requests.Contracts;

public record FreezeContractRequest(uint ContractId, uint DurationDays);
