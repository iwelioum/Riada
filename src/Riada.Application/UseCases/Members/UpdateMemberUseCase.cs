using FluentValidation;
using Riada.Application.DTOs.Requests.Members;
using Riada.Application.DTOs.Responses.Members;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Members;

public class UpdateMemberUseCase
{
    private readonly IValidator<UpdateMemberRequest> _validator;
    private readonly IMemberRepository _memberRepository;

    public UpdateMemberUseCase(IValidator<UpdateMemberRequest> validator, IMemberRepository memberRepository)
    {
        _validator = validator;
        _memberRepository = memberRepository;
    }

    public async Task<MemberResponse> ExecuteAsync(uint memberId, UpdateMemberRequest request, CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        var member = await _memberRepository.GetByIdAsync(memberId, ct)
            ?? throw new NotFoundException("Member", memberId);

        if (!string.IsNullOrEmpty(request.FirstName))
            member.FirstName = request.FirstName;

        if (!string.IsNullOrEmpty(request.LastName))
            member.LastName = request.LastName;

        if (!string.IsNullOrEmpty(request.Gender))
            member.Gender = Enum.Parse<Gender>(request.Gender);

        if (!string.IsNullOrEmpty(request.Nationality))
            member.Nationality = request.Nationality;

        if (!string.IsNullOrEmpty(request.MobilePhone))
            member.MobilePhone = request.MobilePhone;

        if (!string.IsNullOrEmpty(request.AddressStreet))
            member.AddressStreet = request.AddressStreet;

        if (!string.IsNullOrEmpty(request.AddressCity))
            member.AddressCity = request.AddressCity;

        if (!string.IsNullOrEmpty(request.AddressPostalCode))
            member.AddressPostalCode = request.AddressPostalCode;

        if (!string.IsNullOrEmpty(request.PrimaryGoal))
            member.PrimaryGoal = Enum.Parse<PrimaryGoal>(request.PrimaryGoal);

        if (!string.IsNullOrEmpty(request.AcquisitionSource))
            member.AcquisitionSource = Enum.Parse<AcquisitionSource>(request.AcquisitionSource);

        _memberRepository.Update(member);
        await _memberRepository.SaveChangesAsync(ct);

        return new MemberResponse(member.Id, member.LastName, member.FirstName, member.Email, member.Gender.ToString(), member.Status.ToString());
    }
}
