using AspNetCoreRateLimit;

namespace Riada.API.Configuration;

/// <summary>
/// Configures rate limiting policies for protecting authentication endpoints from brute force attacks.
/// </summary>
public static class RateLimitConfig
{
    public static IServiceCollection AddRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Store rate limit counters in memory (use Redis for distributed deployments)
        services.AddMemoryCache();
        services.Configure<IpRateLimitOptions>(configuration.GetSection("IpRateLimit"));
        services.Configure<IpRateLimitPolicies>(configuration.GetSection("IpRateLimitPolicies"));
        
        // Add rate limiting services
        services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
        services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
        services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
        services.AddSingleton<IProcessingStrategy, AsyncKeyedLockProcessingStrategy>();

        return services;
    }

    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder app)
    {
        app.UseIpRateLimiting();
        return app;
    }
}

/// <summary>
/// Custom rate limit configuration to define endpoint-specific policies.
/// </summary>
public class RateLimitConfiguration : IRateLimitConfiguration
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RateLimitConfiguration> _logger;

    public RateLimitConfiguration(IConfiguration configuration, ILogger<RateLimitConfiguration> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public IReadOnlyDictionary<string, IReadOnlyList<IClientPolicy>> ClientWhitelistPolices { get; } =
        new Dictionary<string, IReadOnlyList<IClientPolicy>>();

    public IReadOnlyDictionary<string, IReadOnlyList<IEndpointRateLimitPolicy>>
        EndpointWhitelistPolices { get; } =
        new Dictionary<string, IReadOnlyList<IEndpointRateLimitPolicy>>();

    public IReadOnlyDictionary<string, IRateLimitPolicy> RateLimitPolicies { get; } =
        new Dictionary<string, IRateLimitPolicy>();

    public void RegisterConfiguration()
    {
        var loginAttempts = _configuration.GetValue<int>("RateLimit:Login:Attempts", 5);
        var loginWindow = _configuration.GetValue<int>("RateLimit:Login:WindowMinutes", 1);
        var registerAttempts = _configuration.GetValue<int>("RateLimit:Register:Attempts", 3);
        var registerWindow = _configuration.GetValue<int>("RateLimit:Register:WindowHours", 1);

        _logger.LogInformation(
            "✅ Rate limiting configured: Login {LoginAttempts}/{LoginWindow}m, Register {RegisterAttempts}/{RegisterWindow}h",
            loginAttempts, loginWindow, registerAttempts, registerWindow);
    }
}
