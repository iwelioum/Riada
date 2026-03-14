namespace Riada.Domain.Entities.Membership;

public class ContractOption
{
    public uint Id { get; set; }
    public uint ContractId { get; set; }
    public uint OptionId { get; set; }
    public DateOnly AddedOn { get; set; }
    public DateOnly? RemovedOn { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Contract Contract { get; set; } = null!;
    public ServiceOption Option { get; set; } = null!;
}
