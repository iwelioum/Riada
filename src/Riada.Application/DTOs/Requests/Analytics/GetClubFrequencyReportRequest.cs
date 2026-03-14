namespace Riada.Application.DTOs.Requests.Analytics;

public record GetClubFrequencyReportRequest(DateOnly? DateFrom, DateOnly? DateTo);
