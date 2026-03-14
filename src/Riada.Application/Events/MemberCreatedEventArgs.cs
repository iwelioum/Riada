using Riada.Domain.Entities.Membership;

namespace Riada.Application.Events;

public class MemberCreatedEventArgs : EventArgs
{
    public MemberCreatedEventArgs(Member member, DateTime occurredAtUtc)
    {
        Member = member;
        OccurredAtUtc = occurredAtUtc;
    }

    public Member Member { get; }
    public DateTime OccurredAtUtc { get; }
}
