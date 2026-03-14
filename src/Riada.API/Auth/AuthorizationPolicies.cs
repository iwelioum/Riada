using Microsoft.AspNetCore.Authorization;

namespace Riada.API.Auth;

public static class AuthorizationPolicies
{
    public const string GateAccess = "GateAccess";
    public const string BillingOps = "BillingOps";
    public const string DataProtection = "DataProtection";

    public static void ConfigurePolicies(AuthorizationOptions options)
    {
        // Maps to MySQL roles: role_gate_access, role_billing_ops, role_data_protection
        options.AddPolicy(GateAccess, policy => policy.RequireRole("portique", "admin"));
        options.AddPolicy(BillingOps, policy => policy.RequireRole("billing", "admin"));
        options.AddPolicy(DataProtection, policy => policy.RequireRole("dpo", "admin"));
    }
}
