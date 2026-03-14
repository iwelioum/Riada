using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Riada.Application.Events;

public class MemberLifecycleSubscriber : IHostedService
{
    private readonly IMemberEventDispatcher _dispatcher;
    private readonly ILogger<MemberLifecycleSubscriber> _logger;

    public MemberLifecycleSubscriber(IMemberEventDispatcher dispatcher, ILogger<MemberLifecycleSubscriber> logger)
    {
        _dispatcher = dispatcher;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _dispatcher.MemberCreated += OnMemberCreated;
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _dispatcher.MemberCreated -= OnMemberCreated;
        return Task.CompletedTask;
    }

    private void OnMemberCreated(object? sender, MemberCreatedEventArgs e)
    {
        _logger.LogInformation("Member created: {MemberId} {Email} at {TimestampUtc}", e.Member.Id, e.Member.Email, e.OccurredAtUtc);
    }
}
