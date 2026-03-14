namespace Riada.Application.DTOs.Requests.Members;

public record UpdateMemberRequest(
    string? FirstName,
    string? LastName,
    string? Gender,
    string? Nationality,
    string? MobilePhone,
    string? AddressStreet,
    string? AddressCity,
    string? AddressPostalCode,
    string? PrimaryGoal,
    string? AcquisitionSource);
