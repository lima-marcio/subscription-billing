namespace SubscriptionBilling.Api.Features.Auth;

public static class AuthFeatureExtensions
{
    public static IServiceCollection AddAuthFeature(this IServiceCollection services)
    {
        services.AddSingleton<JwtTokenService>();
        services.AddSingleton<AuthService>();
        return services;
    }
}
