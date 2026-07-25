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
    DateTime NextChargeAt);

public sealed record CreateSubscriptionRequest(Guid SubscriberId, Guid PlanId);
