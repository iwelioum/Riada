using System.Collections.Concurrent;

namespace Riada.API.Security;

public interface IAuthAbuseProtectionService
{
    bool IsTokenGenerationAllowed(string userId, out TimeSpan retryAfter);
    bool IsRefreshAllowed(string subject, out TimeSpan retryAfter);
}

public sealed class AuthAbuseProtectionService : IAuthAbuseProtectionService
{
    private readonly ConcurrentDictionary<string, CounterWindow> _counters = new(StringComparer.Ordinal);
    private long _nextCleanupUnixSeconds;
    private readonly int _tokenRequestsPerMinute;
    private readonly int _refreshRequestsPerMinute;

    public AuthAbuseProtectionService(IConfiguration configuration)
    {
        var section = configuration.GetSection("RateLimit:AuthPerUser");
        _tokenRequestsPerMinute = ReadLimit(section["TokenRequestsPerMinute"], fallback: 3);
        _refreshRequestsPerMinute = ReadLimit(section["RefreshRequestsPerMinute"], fallback: 6);
        _nextCleanupUnixSeconds = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds();
    }

    public bool IsTokenGenerationAllowed(string userId, out TimeSpan retryAfter) =>
        IsAllowed($"token:{NormalizeKey(userId)}", _tokenRequestsPerMinute, TimeSpan.FromMinutes(1), out retryAfter);

    public bool IsRefreshAllowed(string subject, out TimeSpan retryAfter) =>
        IsAllowed($"refresh:{NormalizeKey(subject)}", _refreshRequestsPerMinute, TimeSpan.FromMinutes(1), out retryAfter);

    private bool IsAllowed(string key, int limit, TimeSpan window, out TimeSpan retryAfter)
    {
        var now = DateTimeOffset.UtcNow;
        TryCleanupExpiredEntries(now);

        while (true)
        {
            var current = _counters.GetOrAdd(key, _ => new CounterWindow(Count: 0, WindowEndsAtUtc: now.Add(window)));

            if (current.WindowEndsAtUtc <= now)
            {
                if (_counters.TryUpdate(key, new CounterWindow(Count: 1, WindowEndsAtUtc: now.Add(window)), current))
                {
                    retryAfter = TimeSpan.Zero;
                    return true;
                }

                continue;
            }

            if (current.Count >= limit)
            {
                retryAfter = current.WindowEndsAtUtc - now;
                return false;
            }

            if (_counters.TryUpdate(
                    key,
                    new CounterWindow(Count: current.Count + 1, WindowEndsAtUtc: current.WindowEndsAtUtc),
                    current))
            {
                retryAfter = TimeSpan.Zero;
                return true;
            }
        }
    }

    private static int ReadLimit(string? rawValue, int fallback) =>
        int.TryParse(rawValue, out var parsed) && parsed > 0 ? parsed : fallback;

    private static string NormalizeKey(string raw)
    {
        var normalized = string.IsNullOrWhiteSpace(raw) ? "anonymous" : raw.Trim().ToLowerInvariant();
        return normalized.Length <= 128
            ? normalized
            : normalized[..128];
    }

    private void TryCleanupExpiredEntries(DateTimeOffset now)
    {
        var nowUnix = now.ToUnixTimeSeconds();
        var nextCleanup = Interlocked.Read(ref _nextCleanupUnixSeconds);
        if (nowUnix < nextCleanup)
            return;

        if (Interlocked.CompareExchange(ref _nextCleanupUnixSeconds, now.AddMinutes(5).ToUnixTimeSeconds(), nextCleanup) != nextCleanup)
            return;

        foreach (var (key, counter) in _counters)
        {
            if (counter.WindowEndsAtUtc <= now)
                _counters.TryRemove(key, out _);
        }
    }

    private sealed record CounterWindow(int Count, DateTimeOffset WindowEndsAtUtc);
}
