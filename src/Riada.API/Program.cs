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
using Riada.Application;
using Riada.Application.UseCases.Analytics;
using Riada.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// ── Layer registration ──
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ── Analytics (needs connection string directly) ──
var connectionString = builder.Configuration.GetConnectionString("RiadaDb")!;
builder.Services.AddScoped(_ => new GetMemberRiskScoresUseCase(connectionString));

// ── Authentication (JWT Bearer) ──
var jwtConfig = builder.Configuration.GetSection("Jwt");
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
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!))
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

// ── CORS (for Angular/Electron/React Native) ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontends", policy =>
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin))
                {
                    return false;
                }

                var uri = new Uri(origin);
                return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

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

// Dev-only: allow frontends to hit APIs without JWT while preserving role-based policies.
if (app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
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
