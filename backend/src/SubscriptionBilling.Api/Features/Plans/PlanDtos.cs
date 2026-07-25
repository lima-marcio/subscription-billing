namespace SubscriptionBilling.Api.Features.Plans;

public sealed record PlanResponse(
    Guid Id,
    string Name,
    string? Description,
    decimal PriceAmount,
    string PriceCurrency,
    string BillingCycle,
    int TrialDays,
    bool IsArchived,
    DateTime CreatedAt);

public sealed record CreatePlanRequest(
    string Name,
    string? Description,
    decimal PriceAmount,
    string PriceCurrency,
    string BillingCycle,
    int TrialDays);

public sealed record UpdatePlanRequest(
    string Name,
    string? Description,
    decimal PriceAmount,
    string PriceCurrency,
    string BillingCycle,
    int TrialDays);
