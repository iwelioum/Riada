using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Riada.Domain.Interfaces.StoredProcedures;

namespace Riada.Infrastructure.BackgroundJobs;

/// <summary>
/// Runs daily: calls sp_ExpireElapsedContracts to mark overdue contracts as expired.
/// </summary>
public class ExpireContractsJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpireContractsJob> _logger;

    public ExpireContractsJob(IServiceProvider serviceProvider, ILogger<ExpireContractsJob> logger)
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
                var service = scope.ServiceProvider.GetRequiredService<IContractLifecycleService>();

                var count = await service.ExpireElapsedContractsAsync(stoppingToken);
                if (count > 0)
                    _logger.LogInformation("ExpireContractsJob: {Count} contracts expired", count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ExpireContractsJob failed");
            }

            // Run daily at midnight
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1);
            var delay = nextRun - now;
            await Task.Delay(delay, stoppingToken);
        }
    }
}
