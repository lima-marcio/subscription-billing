using SubscriptionBilling.Api.Domain.Common;

namespace SubscriptionBilling.Api.Infrastructure.Payments;

public sealed class MockPaymentGateway(IConfiguration configuration) : IPaymentGateway
{
    public Task<PaymentResult> ChargeAsync(Guid subscriptionId, Money amount, CancellationToken cancellationToken)
    {
        var successRate = configuration.GetValue("Billing:MockGateway:SuccessRate", 1.0);
        var succeeded = Random.Shared.NextDouble() < successRate;

        var result = succeeded
            ? new PaymentResult(true, GatewayReference: Guid.NewGuid().ToString("N"), FailureReason: null)
            : new PaymentResult(false, GatewayReference: null, FailureReason: "Simulated payment failure.");

        return Task.FromResult(result);
    }
}
