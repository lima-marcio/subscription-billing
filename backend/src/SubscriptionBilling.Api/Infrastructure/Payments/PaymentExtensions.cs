namespace SubscriptionBilling.Api.Infrastructure.Payments;

public static class PaymentExtensions
{
    public static IServiceCollection AddPaymentGateway(this IServiceCollection services)
    {
        services.AddSingleton<IPaymentGateway, MockPaymentGateway>();
        return services;
    }
}
