using SubscriptionBilling.Api.Domain.Common;
using SubscriptionBilling.Api.Domain.Plans;
using SubscriptionBilling.Api.Domain.Subscribers;

namespace SubscriptionBilling.Api.Domain.Subscriptions;

public sealed class Subscription
{
    public Guid Id { get; private set; }

    public Guid SubscriberId { get; private set; }

    public Subscriber Subscriber { get; private set; } = null!;

    public Guid PlanId { get; private set; }

    public Plan Plan { get; private set; } = null!;

    public SubscriptionStatus Status { get; private set; }

    public DateTime StartedAt { get; private set; }

    public DateTime? TrialEndsAt { get; private set; }

    public DateTime CurrentPeriodEnd { get; private set; }

    public DateTime NextChargeAt { get; private set; }

    private Subscription()
    {
    }

    public static Subscription Create(Subscriber subscriber, Plan plan, DateTime now)
    {
        ArgumentNullException.ThrowIfNull(subscriber);
        ArgumentNullException.ThrowIfNull(plan);

        if (plan.IsArchived)
        {
            throw new ArgumentException("Cannot subscribe to an archived plan.", nameof(plan));
        }

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            SubscriberId = subscriber.Id,
            Subscriber = subscriber,
            PlanId = plan.Id,
            Plan = plan,
            StartedAt = now
        };

        if (plan.TrialDays > 0)
        {
            var trialEndsAt = now.AddDays(plan.TrialDays);
            subscription.Status = SubscriptionStatus.Trialing;
            subscription.TrialEndsAt = trialEndsAt;
            subscription.CurrentPeriodEnd = trialEndsAt;
            subscription.NextChargeAt = trialEndsAt;
        }
        else
        {
            var periodEnd = plan.BillingCycle.GetNextPeriodEnd(now);
            subscription.Status = SubscriptionStatus.Active;
            subscription.CurrentPeriodEnd = periodEnd;
            subscription.NextChargeAt = periodEnd;
        }

        return subscription;
    }

    public void Renew()
    {
        EnsureBillable();

        Status = SubscriptionStatus.Active;
        TrialEndsAt = null;
        CurrentPeriodEnd = Plan.BillingCycle.GetNextPeriodEnd(CurrentPeriodEnd);
        NextChargeAt = CurrentPeriodEnd;
    }

    public void MarkPastDue()
    {
        EnsureBillable();

        Status = SubscriptionStatus.PastDue;
    }

    private void EnsureBillable()
    {
        if (Status is not (SubscriptionStatus.Trialing or SubscriptionStatus.Active))
        {
            throw new InvalidOperationException($"Cannot process a charge for a subscription in '{Status}' status.");
        }
    }
}
