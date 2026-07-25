namespace SubscriptionBilling.Api.BackgroundServices;

public static class BillingBackgroundServiceExtensions
{
    public static IServiceCollection AddSubscriptionBillingBackgroundService(this IServiceCollection services)
    {
        services.AddHostedService<SubscriptionBillingBackgroundService>();
        return services;
    }
}
