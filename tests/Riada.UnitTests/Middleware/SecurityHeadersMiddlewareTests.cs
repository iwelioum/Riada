using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Riada.API.Middleware;
using Xunit;

namespace Riada.UnitTests.Middleware;

public class SecurityHeadersMiddlewareTests
{
    [Fact]
    public async Task ShouldApplySecurityHeaders_ForHttpRequests()
    {
        var context = new DefaultHttpContext();
        context.Request.Scheme = "http";

        var middleware = new SecurityHeadersMiddleware(_ => Task.CompletedTask);

        await middleware.InvokeAsync(context);

        var headers = context.Response.Headers;
        headers["X-Content-Type-Options"].ToString().Should().Be("nosniff");
        headers["X-Frame-Options"].ToString().Should().Be("DENY");
        headers["Referrer-Policy"].ToString().Should().Be("no-referrer");
        headers["X-Permitted-Cross-Domain-Policies"].ToString().Should().Be("none");
        headers["Permissions-Policy"].ToString().Should().Contain("geolocation=()");
        headers.ContainsKey("Strict-Transport-Security").Should().BeFalse();
    }

    [Fact]
    public async Task ShouldAddHsts_ForHttpsRequests()
    {
        var context = new DefaultHttpContext();
        context.Request.Scheme = "https";
        context.Request.IsHttps = true;

        var middleware = new SecurityHeadersMiddleware(_ => Task.CompletedTask);

        await middleware.InvokeAsync(context);

        context.Response.Headers["Strict-Transport-Security"]
            .ToString()
            .Should()
            .Contain("max-age=31536000");
    }
}
