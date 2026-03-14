namespace Riada.Domain.Entities.Billing;

/// <summary>
/// Table invoice_sequences: auto-increment counter per year for invoice numbering.
/// PK is the year itself.
/// </summary>
public class InvoiceSequence
{
    public int Year { get; set; }
    public uint LastNumber { get; set; }
}
