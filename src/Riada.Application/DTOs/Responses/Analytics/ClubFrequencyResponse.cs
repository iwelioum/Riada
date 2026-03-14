namespace Riada.Application.DTOs.Responses.Analytics;

public record ClubFrequencyResponse(uint ClubId, string ClubName, int VisitorCount, decimal AverageVisitsPerMember);
