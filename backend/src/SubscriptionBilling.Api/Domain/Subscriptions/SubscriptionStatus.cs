namespace SubscriptionBilling.Api.Domain.Subscriptions;

public enum SubscriptionStatus
{
    Trialing,
    Active,
    PastDue,
    Suspended,
    Cancelled,
    Expired
}
