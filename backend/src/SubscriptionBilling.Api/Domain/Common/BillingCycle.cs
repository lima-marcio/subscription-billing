namespace SubscriptionBilling.Api.Domain.Common;

public enum BillingCycle
{
    Monthly,
    Annual
}

public static class BillingCycleExtensions
{
    public static DateTime GetNextPeriodEnd(this BillingCycle cycle, DateTime from) => cycle switch
    {
        BillingCycle.Monthly => from.AddMonths(1),
        BillingCycle.Annual => from.AddYears(1),
        _ => throw new ArgumentOutOfRangeException(nameof(cycle), cycle, null)
    };
}
