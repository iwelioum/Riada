namespace Riada.Application.DTOs.Responses.Analytics;

public record OptionPopularityResponse(uint OptionId, string OptionName, int SubscriptionCount, decimal PopularityPercentage);
