using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace Riada.Application.Caching;

/// <summary>
/// Distributed cache abstraction for Redis/MemoryCache interoperability
/// Handles serialization, TTL, and cache invalidation patterns
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken ct = default) where T : class;
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task RemoveByPatternAsync(string pattern, CancellationToken ct = default);
}

public class DistributedCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly JsonSerializerOptions _options = new() { PropertyNameCaseInsensitive = true };

    public DistributedCacheService(IDistributedCache cache) => _cache = cache;

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class
    {
        var cachedData = await _cache.GetStringAsync(key, ct);
        return cachedData == null ? null : JsonSerializer.Deserialize<T>(cachedData, _options);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken ct = default) where T : class
    {
        var options = new DistributedCacheEntryOptions();
        if (expiration.HasValue)
            options.AbsoluteExpirationRelativeToNow = expiration;

        var serialized = JsonSerializer.Serialize(value, _options);
        await _cache.SetStringAsync(key, serialized, options, ct);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default) =>
        await _cache.RemoveAsync(key, ct);

    public async Task RemoveByPatternAsync(string pattern, CancellationToken ct = default)
    {
        // Implementation depends on Redis client for pattern-based deletion
        // For distributed cache, might need custom Redis implementation
        await Task.Delay(0, ct); // Placeholder
    }
}

/// <summary>
/// Cache invalidation strategy for related entities
/// </summary>
public interface ICacheInvalidationStrategy
{
    Task InvalidateAsync(string entityType, uint entityId, CancellationToken ct = default);
}

public class SmartCacheInvalidation : ICacheInvalidationStrategy
{
    private readonly ICacheService _cache;
    private static readonly ConcurrentDictionary<string, HashSet<string>> _relationshipMap = new();

    public SmartCacheInvalidation(ICacheService cache) => _cache = cache;

    public async Task InvalidateAsync(string entityType, uint entityId, CancellationToken ct = default)
    {
        var cacheKey = $"{entityType}:{entityId}";
        await _cache.RemoveAsync(cacheKey, ct);

        // Invalidate related caches
        if (_relationshipMap.TryGetValue(entityType, out var related))
        {
            foreach (var relatedType in related)
            {
                var pattern = $"{relatedType}:*:{entityId}:*";
                await _cache.RemoveByPatternAsync(pattern, ct);
            }
        }
    }

    public static void RegisterRelationship(string parentType, string childType)
    {
        _relationshipMap.AddOrUpdate(parentType,
            new HashSet<string> { childType },
            (_, existing) => { existing.Add(childType); return existing; });
    }
}
