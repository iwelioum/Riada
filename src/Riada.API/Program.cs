using System;
using System.Security.Claims;
using System.Text;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Riada.API.Auth;
using Riada.API.Middleware;
using Riada.API.Security;
using Riada.Application;
using Riada.Application.UseCases.Analytics;
using Riada.Infrastructure;
using Riada.Infrastructure.BackgroundJobs;

var builder = WebApplication.CreateBuilder(args);

// ── Layer registration ──
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ── Analytics (needs connection string directly) ──
var connectionString = builder.Configuration.GetConnectionString("RiadaDb")!;
builder.Services.AddScoped(_ => new GetMemberRiskScoresUseCase(connectionString));

// ── Authentication (JWT Bearer with environment-based secrets) ──
var jwtConfig = builder.Configuration.GetSection("Jwt");
var jwtSecret = JwtSecretProvider.GetSecretKey();

// Register token service for JWT generation and refresh
builder.Services.AddSingleton<ITokenService>(sp => 
    new JwtTokenService(builder.Configuration, sp.GetRequiredService<ILogger<JwtTokenService>>()));

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
    logger.LogWarning("⚠️  Development mode enabled. Ensure JWT_SECRET_KEY environment variable is set.");
    logger.LogWarning("⚠️  CORS restricted to: {AllowedOrigins}", string.Join(", ", allowedOrigins));
}

// ── Middleware pipeline ──
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
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
