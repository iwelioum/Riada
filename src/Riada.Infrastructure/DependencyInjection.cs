using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Riada.Domain.Interfaces.Common;
using Riada.Domain.Interfaces.Repositories;
using Riada.Domain.Interfaces.StoredProcedures;
using Riada.Infrastructure.Persistence;
using Riada.Infrastructure.Repositories;
using Riada.Infrastructure.Services;
using Riada.Infrastructure.StoredProcedures;

namespace Riada.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("RiadaDb")
            ?? throw new InvalidOperationException("Connection string 'RiadaDb' not found.");

        // EF Core with Pomelo MySQL
        services.AddDbContext<RiadaDbContext>(options =>
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString),
                mysqlOptions =>
                {
                    mysqlOptions.MigrationsAssembly(typeof(RiadaDbContext).Assembly.FullName);
                    mysqlOptions.EnableRetryOnFailure(3);
                }));

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<IContractRepository, ContractRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<ISubscriptionPlanRepository, SubscriptionPlanRepository>();
        services.AddScoped<IClubRepository, ClubRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IClassSessionRepository, ClassSessionRepository>();
        services.AddScoped<IGuestRepository, GuestRepository>();
        services.AddScoped<IEquipmentRepository, EquipmentRepository>();
        services.AddScoped<IMaintenanceTicketRepository, MaintenanceTicketRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();

        // Stored Procedure services (Dapper — stateless, thread-safe, use singleton)
        services.AddSingleton<IAccessCheckService>(_ => new AccessCheckService(connectionString));
        services.AddSingleton<IBillingService>(_ => new BillingService(connectionString));
        services.AddSingleton<IContractLifecycleService>(_ => new ContractLifecycleService(connectionString));
        services.AddSingleton<IGdprService>(_ => new GdprService(connectionString));
        services.AddSingleton<IAnalyticsService>(_ => new AnalyticsService(connectionString));

        // Services
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }
}
