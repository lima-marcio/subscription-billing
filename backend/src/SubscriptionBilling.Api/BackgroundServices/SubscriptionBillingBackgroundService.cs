using Microsoft.EntityFrameworkCore;
using SubscriptionBilling.Api.Domain.Subscriptions;
using SubscriptionBilling.Api.Infrastructure.Payments;
using SubscriptionBilling.Api.Infrastructure.Persistence;

namespace SubscriptionBilling.Api.BackgroundServices;

public sealed class SubscriptionBillingBackgroundService(
    IServiceScopeFactory scopeFactory,
    IPaymentGateway paymentGateway,
    IConfiguration configuration,
    ILogger<SubscriptionBillingBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSeconds = configuration.GetValue("Billing:BackgroundService:IntervalSeconds", 300);
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(intervalSeconds));

        do
        {
            await ProcessDueSubscriptionsAsync(stoppingToken);
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task ProcessDueSubscriptionsAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;

        var dueSubscriptions = await dbContext.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.NextChargeAt <= now
                && (s.Status == SubscriptionStatus.Trialing || s.Status == SubscriptionStatus.Active))
            .ToListAsync(cancellationToken);

        foreach (var subscription in dueSubscriptions)
        {
            var result = await paymentGateway.ChargeAsync(subscription.Id, subscription.Plan.Price, cancellationToken);

            if (result.Succeeded)
            {
                subscription.Renew();
                dbContext.ChargeAttempts.Add(ChargeAttempt.Succeed(subscription.Id, now, result.GatewayReference!));
                logger.LogInformation("Charged subscription {SubscriptionId} successfully.", subscription.Id);
            }
            else
            {
                subscription.MarkPastDue();
                dbContext.ChargeAttempts.Add(ChargeAttempt.Fail(subscription.Id, now, result.FailureReason ?? "Unknown failure."));
                logger.LogWarning("Failed to charge subscription {SubscriptionId}: {Reason}", subscription.Id, result.FailureReason);
            }
        }

        if (dueSubscriptions.Count > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
