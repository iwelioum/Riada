using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Infrastructure.BackgroundJobs;

/// <summary>
/// Runs daily: calls sp_ExpireElapsedInvoices to mark overdue invoices.
/// </summary>
public class ExpireInvoicesJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpireInvoicesJob> _logger;

    public ExpireInvoicesJob(IServiceProvider serviceProvider, ILogger<ExpireInvoicesJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IBillingService>();

                var count = await service.ExpireElapsedInvoicesAsync(stoppingToken);
                if (count > 0)
                    _logger.LogInformation("ExpireInvoicesJob: {Count} invoices marked overdue", count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ExpireInvoicesJob failed");
            }

            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1).AddHours(1); // Run at 01:00 UTC
            var delay = nextRun - now;
            if (delay < TimeSpan.Zero) delay += TimeSpan.FromDays(1);
            await Task.Delay(delay, stoppingToken);
        }
    }
}
