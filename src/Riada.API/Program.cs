using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DotNetEnv;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Riada.API.Auth;
using Riada.API.Configuration;
using Riada.API.Middleware;
using Riada.API.Security;
using Riada.Application;
using Riada.Application.UseCases.Analytics;
using Riada.Infrastructure;
using Riada.Infrastructure.BackgroundJobs;

Env.TraversePath().Load();
var builder = WebApplication.CreateBuilder(args);

// ── Layer registration ──
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ── Analytics (needs connection string directly) ──
var connectionString = builder.Configuration.GetConnectionString("RiadaDb")!;
builder.Services.AddScoped(_ => new GetMemberRiskScoresUseCase(connectionString));

// ── Rate Limiting ──
builder.Services.AddRateLimiting(builder.Configuration);

// ── Authentication (JWT Bearer with environment-based secrets) ──
var jwtConfig = builder.Configuration.GetSection("Jwt");
if (builder.Environment.IsDevelopment()
    && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("JWT_SECRET_KEY")))
{
    var generatedDevSecret = JwtSecretProvider.GenerateNewSecret();
    Environment.SetEnvironmentVariable("JWT_SECRET_KEY", generatedDevSecret);
    Console.WriteLine("⚠️  JWT_SECRET_KEY was missing. Generated an ephemeral development-only JWT key.");
}

var jwtSecret = JwtSecretProvider.GetSecretKey();
var accessTokenCookieName = AuthCookieSettings.GetAccessTokenCookieName(builder.Configuration);

// Register token service for JWT generation and refresh
builder.Services.AddSingleton<ITokenService>(sp => 
    new JwtTokenService(builder.Configuration, sp.GetRequiredService<ILogger<JwtTokenService>>()));
builder.Services.AddSingleton<IAuthAbuseProtectionService, AuthAbuseProtectionService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidAudience = jwtConfig["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(jwtSecret),
            ClockSkew = TimeSpan.FromSeconds(30) // 30 second clock skew tolerance
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrWhiteSpace(context.Token)
                    && context.Request.Cookies.TryGetValue(accessTokenCookieName, out var cookieToken)
                    && !string.IsNullOrWhiteSpace(cookieToken))
                {
                    context.Token = cookieToken.Trim();
                }

                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var token = (context.SecurityToken as JwtSecurityToken)?.RawData;

                if (string.IsNullOrWhiteSpace(token))
                {
                    if (context.HttpContext.Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
                    {
                        var rawHeader = authorizationHeader.ToString();
                        const string bearerPrefix = "Bearer ";

                        if (rawHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
                            token = rawHeader[bearerPrefix.Length..].Trim();
                    }
                }

                if (string.IsNullOrWhiteSpace(token)
                    && context.HttpContext.Request.Cookies.TryGetValue(accessTokenCookieName, out var cookieToken))
                {
                    token = cookieToken.Trim();
                }

                if (string.IsNullOrWhiteSpace(token))
                    return Task.CompletedTask;

                var tokenService = context.HttpContext.RequestServices.GetRequiredService<ITokenService>();
                if (tokenService.IsTokenRevoked(token))
                    context.Fail("Token has been revoked.");

                return Task.CompletedTask;
            }
        };
    });

// ── Authorization (maps to MySQL roles) ──
builder.Services.AddAuthorization(AuthorizationPolicies.ConfigurePolicies);

// ── Health Checks ──
builder.Services.AddHealthChecks()
    .AddMySql(
        connectionString: builder.Configuration.GetConnectionString("RiadaDb")!,
        name: "MySQL",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy);

// ── Controllers + Swagger ──
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Riada API",
        Version = "v5.0",
        Description = "Gym management system — connected to riada_db MySQL"
    });

    // JWT support in Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── CORS (environment-aware, restrictive defaults) ──
var allowedOrigins = builder.Environment.IsDevelopment()
    ? new[] { "http://localhost:4200", "http://localhost:4201" }
    : new[] { builder.Configuration["AllowedOrigins:Production"] ?? "https://riada.example.com" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontends", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .WithHeaders("Authorization", "Content-Type", "Accept")
            .AllowCredentials();

        // Add security headers for CORS requests
        if (!builder.Environment.IsDevelopment())
        {
            policy.WithExposedHeaders("X-Content-Type-Options", "X-Frame-Options");
        }
    });
});

// ── Hosted background jobs ──
builder.Services.AddHostedService<ExpireContractsJob>();
builder.Services.AddHostedService<ExpireInvoicesJob>();

var app = builder.Build();

// Log security configuration on startup
if (app.Environment.IsDevelopment())
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogWarning("⚠️  Development mode enabled. Set JWT_SECRET_KEY to keep tokens valid across restarts.");
    logger.LogWarning("⚠️  CORS restricted to: {AllowedOrigins}", string.Join(", ", allowedOrigins));
}

// ── Middleware pipeline ──
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

// Rate limiting should come before CORS and authentication
app.UseRateLimiting();

app.UseCors("AllowFrontends");
app.UseAuthentication();

// ── Development bypass with explicit environment variable flag ──
// This ensures dev bypass isn't accidentally enabled in production
var allowDevBypass = bool.TryParse(
    Environment.GetEnvironmentVariable("ALLOW_DEV_BYPASS"), 
    out var result) && result;

if (app.Environment.IsDevelopment() && allowDevBypass)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogWarning(
        "⚠️  SECURITY WARNING: Development bypass is ENABLED. " +
        "This bypasses JWT validation. Only use for local development with trusted code.");
    
    app.Use(async (context, next) =>
    {
        // Only bypass if user is NOT already authenticated with valid JWT
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            var identity = new ClaimsIdentity("DevBypass");
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, "dev-user"));
            identity.AddClaim(new Claim(ClaimTypes.Name, "dev-user"));
            identity.AddClaim(new Claim(ClaimTypes.Role, "admin"));
            identity.AddClaim(new Claim(ClaimTypes.Role, "billing"));
            identity.AddClaim(new Claim(ClaimTypes.Role, "portique"));
            identity.AddClaim(new Claim(ClaimTypes.Role, "dpo"));
            context.User = new ClaimsPrincipal(identity);
        }

        await next();
    });
}
else if (app.Environment.IsDevelopment())
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("✅ Development bypass is DISABLED. Valid JWT required for all requests.");
}

app.UseAuthorization();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.MapControllers();

// ── Health Check ──
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.Run();

// Required for WebApplicationFactory in integration tests
public partial class Program { }
