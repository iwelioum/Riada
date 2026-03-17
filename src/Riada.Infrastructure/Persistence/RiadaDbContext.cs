using Microsoft.EntityFrameworkCore;
using Riada.Domain.Entities.AccessControl;
using Riada.Domain.Entities.Billing;
using Riada.Domain.Entities.ClubManagement;
using Riada.Domain.Entities.Compliance;
using Riada.Domain.Entities.CourseScheduling;
using Riada.Domain.Entities.Membership;

namespace Riada.Infrastructure.Persistence;

public class RiadaDbContext : DbContext
{
    public RiadaDbContext(DbContextOptions<RiadaDbContext> options) : base(options) { }

    // ── Club Management ──
    public DbSet<Club> Clubs => Set<Club>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<MaintenanceTicket> MaintenanceTickets => Set<MaintenanceTicket>();

    // ── Membership ──
    public DbSet<Member> Members => Set<Member>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<ServiceOption> ServiceOptions => Set<ServiceOption>();
    public DbSet<SubscriptionPlanOption> SubscriptionPlanOptions => Set<SubscriptionPlanOption>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<ContractOption> ContractOptions => Set<ContractOption>();

    // ── Billing ──
    public DbSet<InvoiceSequence> InvoiceSequences => Set<InvoiceSequence>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
    public DbSet<Payment> Payments => Set<Payment>();

    // ── Access Control ──
    public DbSet<AccessLogEntry> AccessLog => Set<AccessLogEntry>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<GuestAccessLogEntry> GuestAccessLog => Set<GuestAccessLogEntry>();

    // ── Course Scheduling ──
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<ClassSession> ClassSessions => Set<ClassSession>();
    public DbSet<Booking> Bookings => Set<Booking>();

    // ── Compliance ──
    public DbSet<AuditGdpr> AuditGdpr => Set<AuditGdpr>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RiadaDbContext).Assembly);
    }
}
