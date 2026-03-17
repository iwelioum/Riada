using Riada.Domain.Enums;

namespace Riada.Infrastructure.Persistence.Configurations;

/// <summary>
/// Bidirectional converters between C# enums and MySQL ENUM string values.
/// MySQL stores enums as lowercase snake_case strings.
/// </summary>
public static class EnumConverters
{
    // ── ClubOperationalStatus ──
    public static string ToMySqlString(this ClubOperationalStatus v) => v switch
    {
        ClubOperationalStatus.Open => "open",
        ClubOperationalStatus.TemporarilyClosed => "temporarily_closed",
        ClubOperationalStatus.PermanentlyClosed => "permanently_closed",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static ClubOperationalStatus ToClubOperationalStatus(string v) => v switch
    {
        "open" => ClubOperationalStatus.Open,
        "temporarily_closed" => ClubOperationalStatus.TemporarilyClosed,
        "permanently_closed" => ClubOperationalStatus.PermanentlyClosed,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── Gender ──
    public static string ToMySqlString(this Gender v) => v switch
    {
        Gender.Male => "male",
        Gender.Female => "female",
        Gender.Unspecified => "unspecified",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static Gender ToGender(string v) => v switch
    {
        "male" => Gender.Male,
        "female" => Gender.Female,
        "unspecified" => Gender.Unspecified,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── MemberStatus ──
    public static string ToMySqlString(this MemberStatus v) => v switch
    {
        MemberStatus.Active => "active",
        MemberStatus.Suspended => "suspended",
        MemberStatus.Anonymized => "anonymized",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static MemberStatus ToMemberStatus(string v) => v switch
    {
        "active" => MemberStatus.Active,
        "suspended" => MemberStatus.Suspended,
        "anonymized" => MemberStatus.Anonymized,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── PrimaryGoal ──
    public static string ToMySqlString(this PrimaryGoal v) => v switch
    {
        PrimaryGoal.WeightLoss => "weight_loss",
        PrimaryGoal.MuscleGain => "muscle_gain",
        PrimaryGoal.Fitness => "fitness",
        PrimaryGoal.Maintenance => "maintenance",
        PrimaryGoal.Other => "other",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static PrimaryGoal ToPrimaryGoal(string v) => v switch
    {
        "weight_loss" => PrimaryGoal.WeightLoss,
        "muscle_gain" => PrimaryGoal.MuscleGain,
        "fitness" => PrimaryGoal.Fitness,
        "maintenance" => PrimaryGoal.Maintenance,
        "other" => PrimaryGoal.Other,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── AcquisitionSource ──
    public static string ToMySqlString(this AcquisitionSource v) => v switch
    {
        AcquisitionSource.WebAdvertising => "web_advertising",
        AcquisitionSource.SocialMedia => "social_media",
        AcquisitionSource.WordOfMouth => "word_of_mouth",
        AcquisitionSource.Other => "other",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static AcquisitionSource ToAcquisitionSource(string v) => v switch
    {
        "web_advertising" => AcquisitionSource.WebAdvertising,
        "social_media" => AcquisitionSource.SocialMedia,
        "word_of_mouth" => AcquisitionSource.WordOfMouth,
        "other" => AcquisitionSource.Other,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── ContractType ──
    public static string ToMySqlString(this ContractType v) => v switch
    {
        ContractType.FixedTerm => "fixed_term",
        ContractType.OpenEnded => "open_ended",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static ContractType ToContractType(string v) => v switch
    {
        "fixed_term" => ContractType.FixedTerm,
        "open_ended" => ContractType.OpenEnded,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── ContractStatus ──
    public static string ToMySqlString(this ContractStatus v) => v switch
    {
        ContractStatus.Active => "active",
        ContractStatus.Suspended => "suspended",
        ContractStatus.Expired => "expired",
        ContractStatus.Cancelled => "cancelled",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static ContractStatus ToContractStatus(string v) => v switch
    {
        "active" => ContractStatus.Active,
        "suspended" => ContractStatus.Suspended,
        "expired" => ContractStatus.Expired,
        "cancelled" => ContractStatus.Cancelled,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── InvoiceStatus ──
    public static string ToMySqlString(this InvoiceStatus v) => v switch
    {
        InvoiceStatus.Draft => "draft",
        InvoiceStatus.Issued => "issued",
        InvoiceStatus.Paid => "paid",
        InvoiceStatus.PartiallyPaid => "partially_paid",
        InvoiceStatus.Overdue => "overdue",
        InvoiceStatus.Cancelled => "cancelled",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static InvoiceStatus ToInvoiceStatus(string v) => v switch
    {
        "draft" => InvoiceStatus.Draft,
        "issued" => InvoiceStatus.Issued,
        "paid" => InvoiceStatus.Paid,
        "partially_paid" => InvoiceStatus.PartiallyPaid,
        "overdue" => InvoiceStatus.Overdue,
        "cancelled" => InvoiceStatus.Cancelled,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── InvoiceLineType ──
    public static string ToMySqlString(this InvoiceLineType v) => v switch
    {
        InvoiceLineType.Subscription => "subscription",
        InvoiceLineType.Option => "option",
        InvoiceLineType.EnrollmentFee => "enrollment_fee",
        InvoiceLineType.Penalty => "penalty",
        InvoiceLineType.CreditNote => "credit_note",
        InvoiceLineType.Other => "other",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static InvoiceLineType ToInvoiceLineType(string v) => v switch
    {
        "subscription" => InvoiceLineType.Subscription,
        "option" => InvoiceLineType.Option,
        "enrollment_fee" => InvoiceLineType.EnrollmentFee,
        "penalty" => InvoiceLineType.Penalty,
        "credit_note" => InvoiceLineType.CreditNote,
        "other" => InvoiceLineType.Other,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── PaymentStatus ──
    public static string ToMySqlString(this PaymentStatus v) => v switch
    {
        PaymentStatus.Pending => "pending",
        PaymentStatus.Succeeded => "succeeded",
        PaymentStatus.Failed => "failed",
        PaymentStatus.Refunded => "refunded",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static PaymentStatus ToPaymentStatus(string v) => v switch
    {
        "pending" => PaymentStatus.Pending,
        "succeeded" => PaymentStatus.Succeeded,
        "failed" => PaymentStatus.Failed,
        "refunded" => PaymentStatus.Refunded,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── PaymentMethod ──
    public static string ToMySqlString(this PaymentMethod v) => v switch
    {
        PaymentMethod.SepaDirectDebit => "sepa_direct_debit",
        PaymentMethod.CreditCard => "credit_card",
        PaymentMethod.Cash => "cash",
        PaymentMethod.BankTransfer => "bank_transfer",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static PaymentMethod ToPaymentMethod(string v) => v switch
    {
        "sepa_direct_debit" => PaymentMethod.SepaDirectDebit,
        "credit_card" => PaymentMethod.CreditCard,
        "cash" => PaymentMethod.Cash,
        "bank_transfer" => PaymentMethod.BankTransfer,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── AccessDecision ──
    public static string ToMySqlString(this AccessDecision v) => v switch
    {
        AccessDecision.Granted => "granted",
        AccessDecision.Denied => "denied",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static AccessDecision ToAccessDecision(string v) => v switch
    {
        "granted" => AccessDecision.Granted,
        "denied" => AccessDecision.Denied,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── GuestStatus ──
    public static string ToMySqlString(this GuestStatus v) => v switch
    {
        GuestStatus.Active => "active",
        GuestStatus.Banned => "banned",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static GuestStatus ToGuestStatus(string v) => v switch
    {
        "active" => GuestStatus.Active,
        "banned" => GuestStatus.Banned,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── EquipmentStatus ──
    public static string ToMySqlString(this EquipmentStatus v) => v switch
    {
        EquipmentStatus.InService => "in_service",
        EquipmentStatus.UnderMaintenance => "under_maintenance",
        EquipmentStatus.Broken => "broken",
        EquipmentStatus.Retired => "retired",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static EquipmentStatus ToEquipmentStatus(string v) => v switch
    {
        "in_service" => EquipmentStatus.InService,
        "under_maintenance" => EquipmentStatus.UnderMaintenance,
        "broken" => EquipmentStatus.Broken,
        "retired" => EquipmentStatus.Retired,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── MaintenanceType ──
    public static string ToMySqlString(this MaintenanceType v) => v switch
    {
        MaintenanceType.Breakdown => "breakdown",
        MaintenanceType.Preventive => "preventive",
        MaintenanceType.Installation => "installation",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static MaintenanceType ToMaintenanceType(string v) => v switch
    {
        "breakdown" => MaintenanceType.Breakdown,
        "preventive" => MaintenanceType.Preventive,
        "installation" => MaintenanceType.Installation,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── MaintenanceTicketStatus ──
    public static string ToMySqlString(this MaintenanceTicketStatus v) => v switch
    {
        MaintenanceTicketStatus.Reported => "reported",
        MaintenanceTicketStatus.Assigned => "assigned",
        MaintenanceTicketStatus.InProgress => "in_progress",
        MaintenanceTicketStatus.Resolved => "resolved",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static MaintenanceTicketStatus ToMaintenanceTicketStatus(string v) => v switch
    {
        "reported" => MaintenanceTicketStatus.Reported,
        "assigned" => MaintenanceTicketStatus.Assigned,
        "in_progress" => MaintenanceTicketStatus.InProgress,
        "resolved" => MaintenanceTicketStatus.Resolved,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── MaintenancePriority ──
    public static string ToMySqlString(this MaintenancePriority v) => v switch
    {
        MaintenancePriority.Low => "low",
        MaintenancePriority.Medium => "medium",
        MaintenancePriority.High => "high",
        MaintenancePriority.Critical => "critical",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static MaintenancePriority ToMaintenancePriority(string v) => v switch
    {
        "low" => MaintenancePriority.Low,
        "medium" => MaintenancePriority.Medium,
        "high" => MaintenancePriority.High,
        "critical" => MaintenancePriority.Critical,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── DifficultyLevel ──
    public static string ToMySqlString(this DifficultyLevel v) => v switch
    {
        DifficultyLevel.Beginner => "beginner",
        DifficultyLevel.Intermediate => "intermediate",
        DifficultyLevel.Advanced => "advanced",
        DifficultyLevel.AllLevels => "all_levels",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static DifficultyLevel ToDifficultyLevel(string? v) => v switch
    {
        "beginner" => DifficultyLevel.Beginner,
        "intermediate" => DifficultyLevel.Intermediate,
        "advanced" => DifficultyLevel.Advanced,
        "all_levels" => DifficultyLevel.AllLevels,
        _ => DifficultyLevel.AllLevels
    };

    // ── ActivityType ──
    public static string ToMySqlString(this ActivityType v) => v switch
    {
        ActivityType.Cardio => "cardio",
        ActivityType.Strength => "strength",
        ActivityType.Flexibility => "flexibility",
        ActivityType.Relaxation => "relaxation",
        ActivityType.Dance => "dance",
        ActivityType.Combat => "combat",
        ActivityType.Mixed => "mixed",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static ActivityType ToActivityType(string? v) => v switch
    {
        "cardio" => ActivityType.Cardio,
        "strength" => ActivityType.Strength,
        "flexibility" => ActivityType.Flexibility,
        "relaxation" => ActivityType.Relaxation,
        "dance" => ActivityType.Dance,
        "combat" => ActivityType.Combat,
        "mixed" => ActivityType.Mixed,
        _ => ActivityType.Mixed
    };

    // ── BookingStatus ──
    public static string ToMySqlString(this BookingStatus v) => v switch
    {
        BookingStatus.Confirmed => "confirmed",
        BookingStatus.Waitlisted => "waitlisted",
        BookingStatus.Cancelled => "cancelled",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static BookingStatus ToBookingStatus(string v) => v switch
    {
        "confirmed" => BookingStatus.Confirmed,
        "waitlisted" => BookingStatus.Waitlisted,
        "cancelled" => BookingStatus.Cancelled,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── ShiftType ──
    public static string ToMySqlString(this ShiftType v) => v switch
    {
        ShiftType.Opening => "opening",
        ShiftType.Morning => "morning",
        ShiftType.Afternoon => "afternoon",
        ShiftType.Evening => "evening",
        ShiftType.Closing => "closing",
        ShiftType.Custom => "custom",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static ShiftType ToShiftType(string v) => v switch
    {
        "opening" => ShiftType.Opening,
        "morning" => ShiftType.Morning,
        "afternoon" => ShiftType.Afternoon,
        "evening" => ShiftType.Evening,
        "closing" => ShiftType.Closing,
        "custom" => ShiftType.Custom,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };

    // ── EmployeeRole ──
    public static string ToMySqlString(this EmployeeRole v) => v switch
    {
        EmployeeRole.Instructor => "instructor",
        EmployeeRole.Manager => "manager",
        EmployeeRole.Receptionist => "receptionist",
        EmployeeRole.Technician => "technician",
        EmployeeRole.Intern => "intern",
        EmployeeRole.Management => "management",
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
    public static EmployeeRole ToEmployeeRole(string v) => v switch
    {
        "instructor" => EmployeeRole.Instructor,
        "manager" => EmployeeRole.Manager,
        "receptionist" => EmployeeRole.Receptionist,
        "technician" => EmployeeRole.Technician,
        "intern" => EmployeeRole.Intern,
        "management" => EmployeeRole.Management,
        _ => throw new ArgumentOutOfRangeException(nameof(v))
    };
}
