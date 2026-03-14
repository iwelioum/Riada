using Riada.Domain.Entities.Membership;

namespace Riada.Application.Events;

public interface IMemberEventDispatcher
{
    event EventHandler<MemberCreatedEventArgs>? MemberCreated;
    void PublishMemberCreated(Member member);
}
