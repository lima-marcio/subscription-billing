using Microsoft.EntityFrameworkCore;
using SubscriptionBilling.Api.Domain.Subscriptions;
using SubscriptionBilling.Api.Infrastructure.Payments;
using SubscriptionBilling.Api.Infrastructure.Persistence;

namespace SubscriptionBilling.Api.Features.Subscriptions;

public sealed class SubscriptionService(AppDbContext dbContext, IPaymentGateway paymentGateway)
{
    public async Task<IReadOnlyList<SubscriptionResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var subscriptions = await dbContext.Subscriptions
            .Include(s => s.Subscriber)
            .Include(s => s.Plan)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync(cancellationToken);

        return subscriptions.Select(ToResponse).ToList();
    }

    public async Task<SubscriptionResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var subscription = await dbContext.Subscriptions
            .Include(s => s.Subscriber)
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        return subscription is null ? null : ToResponse(subscription);
    }

    public async Task<SubscriptionResponse> CreateAsync(CreateSubscriptionRequest request, CancellationToken cancellationToken)
    {
        var subscriber = await dbContext.Subscribers.FindAsync([request.SubscriberId], cancellationToken)
            ?? throw new ArgumentException($"Subscriber '{request.SubscriberId}' was not found.", nameof(request));

        var plan = await dbContext.Plans.FindAsync([request.PlanId], cancellationToken)
            ?? throw new ArgumentException($"Plan '{request.PlanId}' was not found.", nameof(request));

        var subscription = Subscription.Create(subscriber, plan, DateTime.UtcNow);

        dbContext.Subscriptions.Add(subscription);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(subscription);
    }

    public async Task<SubscriptionResponse?> ReactivateAsync(Guid id, CancellationToken cancellationToken)
    {
        var subscription = await dbContext.Subscriptions
            .Include(s => s.Subscriber)
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (subscription is null)
        {
            return null;
        }

        if (subscription.Status != SubscriptionStatus.Suspended)
        {
            throw new InvalidOperationException($"Cannot reactivate a subscription in '{subscription.Status}' status.");
        }

        var now = DateTime.UtcNow;
        var result = await paymentGateway.ChargeAsync(subscription.Id, subscription.Plan.Price, cancellationToken);

        if (result.Succeeded)
        {
            subscription.Reactivate(now);
            dbContext.ChargeAttempts.Add(ChargeAttempt.Succeed(subscription.Id, now, result.GatewayReference!));
        }
        else
        {
            dbContext.ChargeAttempts.Add(ChargeAttempt.Fail(subscription.Id, now, result.FailureReason ?? "Unknown failure."));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(subscription);
    }

    private static SubscriptionResponse ToResponse(Subscription subscription) => new(
        subscription.Id,
        subscription.SubscriberId,
        subscription.Subscriber.Name,
        subscription.Subscriber.Email,
        subscription.PlanId,
        subscription.Plan.Name,
        subscription.Status.ToString(),
        subscription.StartedAt,
        subscription.TrialEndsAt,
        subscription.CurrentPeriodEnd,
        subscription.NextChargeAt);
}
