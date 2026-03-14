namespace Riada.Application.DTOs.Responses.Members;

public record MemberResponse(uint Id, string LastName, string FirstName, string Email, string Gender, string Status);
