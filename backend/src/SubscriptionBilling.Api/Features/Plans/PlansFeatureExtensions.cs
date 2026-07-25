namespace SubscriptionBilling.Api.Features.Plans;

public static class PlansFeatureExtensions
{
    public static IServiceCollection AddPlansFeature(this IServiceCollection services)
    {
        services.AddScoped<PlanService>();
        return services;
    }
}
