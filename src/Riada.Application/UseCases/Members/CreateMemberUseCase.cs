using FluentValidation;
using Riada.Application.DTOs.Requests.Members;
using Riada.Application.DTOs.Responses.Members;
using Riada.Domain.Entities.Membership;
using Riada.Domain.Enums;
using Riada.Domain.Exceptions;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Members;

public class CreateMemberUseCase
{
    private readonly IMemberRepository _memberRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<CreateMemberRequest> _validator;

    public CreateMemberUseCase(IMemberRepository memberRepository, IUnitOfWork unitOfWork, IValidator<CreateMemberRequest> validator)
    {
        _memberRepository = memberRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<MemberResponse> ExecuteAsync(CreateMemberRequest request, CancellationToken ct = default)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var member = new Member
        {
            LastName = request.LastName,
            FirstName = request.FirstName,
            Email = request.Email,
            Gender = Enum.Parse<Gender>(request.Gender),
            DateOfBirth = request.DateOfBirth,
            Nationality = request.Nationality,
            MobilePhone = request.MobilePhone,
            AddressStreet = request.AddressStreet,
            AddressCity = request.AddressCity,
            AddressPostalCode = request.AddressPostalCode,
            ReferralMemberId = request.ReferralMemberId,
            PrimaryGoal = !string.IsNullOrEmpty(request.PrimaryGoal) ? Enum.Parse<PrimaryGoal>(request.PrimaryGoal) : null,
            AcquisitionSource = !string.IsNullOrEmpty(request.AcquisitionSource) ? Enum.Parse<AcquisitionSource>(request.AcquisitionSource) : null,
            MedicalCertificateProvided = request.MedicalCertificateProvided,
            MarketingConsent = request.MarketingConsent,
            Status = MemberStatus.Active
        };

        await _memberRepository.AddAsync(member, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new MemberResponse(member.Id, member.LastName, member.FirstName, member.Email, member.Gender.ToString(), member.Status.ToString());
    }
}
