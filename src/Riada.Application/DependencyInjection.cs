using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Riada.Application.UseCases.Access;
using Riada.Application.UseCases.Analytics;
using Riada.Application.UseCases.Billing;
using Riada.Application.UseCases.Contracts;
using Riada.Application.UseCases.Courses;
using Riada.Application.UseCases.Equipment;
using Riada.Application.UseCases.Guests;
using Riada.Application.UseCases.Employees;
using Riada.Application.UseCases.Members;
using Riada.Application.UseCases.Shifts;
using Riada.Application.Events;

namespace Riada.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Validators (auto-register all from this assembly)
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Events
        services.AddSingleton<IMemberEventDispatcher, MemberEventDispatcher>();
        services.AddHostedService<MemberLifecycleSubscriber>();

        // Use Cases — Employees
        services.AddScoped<ListEmployeesUseCase>();
        services.AddScoped<GetEmployeeDetailUseCase>();
        services.AddScoped<CreateEmployeeUseCase>();
        services.AddScoped<UpdateEmployeeUseCase>();

        // Use Cases — Access
        services.AddScoped<CheckMemberAccessUseCase>();
        services.AddScoped<CheckGuestAccessUseCase>();

        // Use Cases — Members
        services.AddScoped<GetMemberDetailUseCase>();
        services.AddScoped<ListMembersUseCase>();
        services.AddScoped<AnonymizeMemberUseCase>();
        services.AddScoped<CreateMemberUseCase>();
        services.AddScoped<UpdateMemberUseCase>();

        // Use Cases — Contracts
        services.AddScoped<FreezeContractUseCase>();
        services.AddScoped<RenewContractUseCase>();
        services.AddScoped<CreateContractUseCase>();

        // Use Cases — Billing
        services.AddScoped<GenerateMonthlyInvoiceUseCase>();
        services.AddScoped<GetInvoiceDetailUseCase>();
        services.AddScoped<RecordPaymentUseCase>();

        // Use Cases — Courses
        services.AddScoped<GetCoursesUseCase>();
        services.AddScoped<GetSessionByIdUseCase>();
        services.AddScoped<GetUpcomingSessionsUseCase>();
        services.AddScoped<GetSessionsRangeUseCase>();
        services.AddScoped<BookSessionUseCase>();
        services.AddScoped<CancelBookingUseCase>();

        // Use Cases — Guests
        services.AddScoped<RegisterGuestUseCase>();
        services.AddScoped<ListGuestsUseCase>();
        services.AddScoped<BanGuestUseCase>();

        // Use Cases — Equipment
        services.AddScoped<ListEquipmentUseCase>();
        services.AddScoped<CreateMaintenanceTicketUseCase>();
        services.AddScoped<UpdateTicketStatusUseCase>();

        // Use Cases — Shifts
        services.AddScoped<GetWeekShiftsUseCase>();
        services.AddScoped<CreateShiftUseCase>();
        services.AddScoped<DeleteShiftUseCase>();

        // Use Cases — Analytics
        services.AddScoped<GetClubFrequencyReportUseCase>();
        services.AddScoped<GetOptionPopularityUseCase>();
        services.AddScoped<RunSystemHealthCheckUseCase>();

        return services;
    }
}
