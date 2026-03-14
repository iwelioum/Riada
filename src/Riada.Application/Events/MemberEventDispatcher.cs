using Riada.Domain.Entities.Membership;

namespace Riada.Application.Events;

public class MemberEventDispatcher : IMemberEventDispatcher
{
    public event EventHandler<MemberCreatedEventArgs>? MemberCreated;

    public void PublishMemberCreated(Member member)
    {
        MemberCreated?.Invoke(this, new MemberCreatedEventArgs(member, DateTime.UtcNow));
    }
}
