using FluentValidation;
using FluentValidation.Results;

namespace Riada.Application.Common.Validation;

/// <summary>
/// Custom validation rules for Riada domain.
/// Provides reusable validators for emails, phone numbers, and business rules.
/// </summary>
public static class CustomValidationRules
{
    /// <summary>
    /// Validates email format using RFC 5322 simplified regex
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidEmail<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email format is invalid")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters");
    }

    /// <summary>
    /// Validates phone number format (international format)
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidPhoneNumber<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty().WithMessage("Phone number is required")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number format is invalid (use E.164 format)")
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters");
    }

    /// <summary>
    /// Validates amount is positive and within reasonable limits
    /// </summary>
    public static IRuleBuilderOptions<T, decimal> ValidAmount<T>(this IRuleBuilder<T, decimal> ruleBuilder)
    {
        return ruleBuilder
            .GreaterThan(0).WithMessage("Amount must be greater than 0")
            .LessThanOrEqualTo(999999.99m).WithMessage("Amount must not exceed 999,999.99");
    }

    /// <summary>
    /// Validates membership status values
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidMembershipStatus<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        var validStatuses = new[] { "Active", "Inactive", "Suspended", "Expired", "Cancelled" };
        return ruleBuilder
            .NotEmpty().WithMessage("Status is required")
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of: {string.Join(", ", validStatuses)}");
    }

    /// <summary>
    /// Validates contract type
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidContractType<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        var validTypes = new[] { "Monthly", "Quarterly", "Annual", "ClassPackage" };
        return ruleBuilder
            .NotEmpty().WithMessage("Contract type is required")
            .Must(type => validTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Contract type must be one of: {string.Join(", ", validTypes)}");
    }

    /// <summary>
    /// Validates date is not in the past
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> FutureDate<T>(this IRuleBuilder<T, DateTime> ruleBuilder)
    {
        return ruleBuilder
            .GreaterThan(DateTime.UtcNow).WithMessage("Date must be in the future");
    }

    /// <summary>
    /// Validates date is not in the future
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> PastDate<T>(this IRuleBuilder<T, DateTime> ruleBuilder)
    {
        return ruleBuilder
            .LessThan(DateTime.UtcNow).WithMessage("Date must be in the past");
    }

    /// <summary>
    /// Validates an age is within reasonable bounds (18-120 years old)
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> ValidAge<T>(this IRuleBuilder<T, DateTime> ruleBuilder, int minAge = 18)
    {
        return ruleBuilder
            .Must(dob => CalculateAge(dob) >= minAge)
            .WithMessage($"Member must be at least {minAge} years old");
    }

    /// <summary>
    /// Validates postal code format (simple validation)
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidPostalCode<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty().WithMessage("Postal code is required")
            .Length(3, 10).WithMessage("Postal code must be between 3 and 10 characters")
            .Matches(@"^[A-Za-z0-9\s-]+$").WithMessage("Postal code contains invalid characters");
    }

    /// <summary>
    /// Validates a collection is not empty
    /// </summary>
    public static IRuleBuilderOptions<T, ICollection<TElement>> NotEmptyCollection<T, TElement>(
        this IRuleBuilder<T, ICollection<TElement>> ruleBuilder)
    {
        return ruleBuilder
            .Must(c => c != null && c.Count > 0)
            .WithMessage("At least one item is required");
    }

    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.UtcNow;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }
}

/// <summary>
/// Async cross-field validators for business logic
/// </summary>
public abstract class BusinessRuleValidator<T> : AbstractValidator<T>
{
    /// <summary>
    /// Validates a business rule asynchronously
    /// </summary>
    protected void RuleForBusinessLogic(
        Func<T, Task<bool>> validationFunction,
        string errorMessage)
    {
        RuleFor(r => r)
            .MustAsync(async (item, _) => await validationFunction(item))
            .WithMessage(errorMessage);
    }
}
