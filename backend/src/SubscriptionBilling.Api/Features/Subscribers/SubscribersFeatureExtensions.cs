namespace SubscriptionBilling.Api.Features.Subscribers;

public static class SubscribersFeatureExtensions
{
    public static IServiceCollection AddSubscribersFeature(this IServiceCollection services)
    {
        services.AddScoped<SubscriberService>();
        return services;
    }
}
