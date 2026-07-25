namespace SubscriptionBilling.Api.Features.Subscriptions;

public static class SubscriptionsFeatureExtensions
{
    public static IServiceCollection AddSubscriptionsFeature(this IServiceCollection services)
    {
        services.AddScoped<SubscriptionService>();
        return services;
    }
}
