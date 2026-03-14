using System.Security.Cryptography;
using System.Text;

namespace Riada.API.Security;

/// <summary>
/// Input sanitization and validation utilities
/// Prevents SQL injection, XSS, buffer overflow attacks
/// </summary>
public static class InputSanitizer
{
    private const int MaxStringLength = 10000;
    private const int MaxArrayLength = 100000;

    /// <summary>
    /// Sanitize string input: trim, validate length, check for malicious patterns
    /// </summary>
    public static string SanitizeString(string? input, int maxLength = MaxStringLength)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        var trimmed = input.Trim();

        if (trimmed.Length > maxLength)
            throw new ArgumentException($"Input exceeds maximum length of {maxLength}");

        // Check for SQL injection patterns
        if (ContainsSqlInjectionPatterns(trimmed))
            throw new ArgumentException("Input contains invalid characters");

        // Check for XSS patterns
        if (ContainsXssPatterns(trimmed))
            throw new ArgumentException("Input contains invalid HTML");

        return trimmed;
    }

    /// <summary>
    /// Sanitize numeric input
    /// </summary>
    public static decimal SanitizeDecimal(decimal value, decimal minValue = decimal.MinValue, decimal maxValue = decimal.MaxValue)
    {
        if (value < minValue || value > maxValue)
            throw new ArgumentException($"Value must be between {minValue} and {maxValue}");

        // Limit decimal places to prevent precision issues
        return Math.Round(value, 2);
    }

    /// <summary>
    /// Hash sensitive data for audit trails (one-way)
    /// </summary>
    public static string HashSensitiveData(string data)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private static bool ContainsSqlInjectionPatterns(string input) =>
        input.Contains("--", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("/*", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("*/", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("xp_", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("sp_", StringComparison.OrdinalIgnoreCase) ||
        input.Contains(";DROP", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("UNION", StringComparison.OrdinalIgnoreCase);

    private static bool ContainsXssPatterns(string input) =>
        input.Contains("<script", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("onclick", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("onerror", StringComparison.OrdinalIgnoreCase) ||
        input.Contains("javascript:", StringComparison.OrdinalIgnoreCase);
}

/// <summary>
/// Rate limiting handler for API abuse prevention
/// </summary>
public interface IRateLimitService
{
    Task<bool> IsAllowedAsync(string key, int requestsPerMinute = 60, CancellationToken ct = default);
}

public class RateLimitService : IRateLimitService
{
    private static readonly Dictionary<string, (int count, DateTime resetTime)> _requests = [];
    private readonly object _lock = new();

    public async Task<bool> IsAllowedAsync(string key, int requestsPerMinute = 60, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            lock (_lock)
            {
                var now = DateTime.UtcNow;
                if (_requests.TryGetValue(key, out var entry))
                {
                    if (now < entry.resetTime)
                    {
                        if (entry.count >= requestsPerMinute)
                            return false;

                        _requests[key] = (entry.count + 1, entry.resetTime);
                    }
                    else
                    {
                        _requests[key] = (1, now.AddMinutes(1));
                    }
                }
                else
                {
                    _requests[key] = (1, now.AddMinutes(1));
                }

                // Cleanup old entries
                var oldKeys = _requests.Where(x => x.Value.resetTime < now).Select(x => x.Key).ToList();
                foreach (var oldKey in oldKeys)
                    _requests.Remove(oldKey);

                return true;
            }
        }, ct);
    }
}
