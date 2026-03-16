using System.Security.Cryptography;
using System.Text;

namespace Riada.API.Security;

/// <summary>
/// Secure JWT secret provider that loads from environment variables.
/// Never stores secrets in configuration files or logs.
/// </summary>
public static class JwtSecretProvider
{
    private const string EnvVarName = "JWT_SECRET_KEY";
    private const int MinimumSecretLength = 32; // 256 bits

    /// <summary>
    /// Gets the JWT secret key from environment variable.
    /// Raises exception if not found or invalid.
    /// </summary>
    public static byte[] GetSecretKey()
    {
        var secretKey = Environment.GetEnvironmentVariable(EnvVarName);

        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException(
                $"JWT secret key not configured. " +
                $"Set environment variable: {EnvVarName} " +
                $"(must be Base64-encoded 256-bit secret)");
        }

        try
        {
            var decoded = Convert.FromBase64String(secretKey);
            if (decoded.Length < MinimumSecretLength)
            {
                throw new InvalidOperationException(
                    $"JWT secret key is too short. Minimum {MinimumSecretLength} bytes required, " +
                    $"got {decoded.Length} bytes.");
            }

            return decoded;
        }
        catch (FormatException)
        {
            throw new InvalidOperationException(
                $"JWT secret key is not valid Base64. " +
                $"Ensure {EnvVarName} contains Base64-encoded secret.");
        }
    }

    /// <summary>
    /// Generates a new cryptographically secure 256-bit secret (for setup).
    /// Returns Base64-encoded string suitable for environment variable.
    /// </summary>
    public static string GenerateNewSecret()
    {
        using (var rng = RandomNumberGenerator.Create())
        {
            var bytes = new byte[32]; // 256 bits
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }
    }
}
