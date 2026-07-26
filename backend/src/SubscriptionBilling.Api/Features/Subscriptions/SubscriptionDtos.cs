namespace SubscriptionBilling.Api.Features.Subscriptions;

public sealed record SubscriptionResponse(
    Guid Id,
    Guid SubscriberId,
    string SubscriberName,
    string SubscriberEmail,
    Guid PlanId,
    string PlanName,
    string Status,
    DateTime StartedAt,
    DateTime? TrialEndsAt,
    DateTime CurrentPeriodEnd,
    DateTime NextChargeAt,
    DateTime? CancelledAt,
    Guid? PendingPlanId,
    string? PendingPlanName);

public sealed record CreateSubscriptionRequest(Guid SubscriberId, Guid PlanId);

public sealed record SchedulePlanChangeRequest(Guid NewPlanId);
