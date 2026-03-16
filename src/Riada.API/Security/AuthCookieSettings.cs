namespace Riada.API.Security;

public static class AuthCookieSettings
{
    public const string DefaultAccessTokenCookieName = "riada_access_token";
    public const string DefaultRefreshTokenCookieName = "riada_refresh_token";

    public static string GetAccessTokenCookieName(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        return ReadCookieName(
            configuration["Jwt:Cookies:AccessTokenName"],
            DefaultAccessTokenCookieName);
    }

    public static string GetRefreshTokenCookieName(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        return ReadCookieName(
            configuration["Jwt:Cookies:RefreshTokenName"],
            DefaultRefreshTokenCookieName);
    }

    private static string ReadCookieName(string? configuredName, string fallback)
    {
        var normalized = configuredName?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? fallback : normalized;
    }
}
