using SubscriptionBilling.Api.Domain.Common;

namespace SubscriptionBilling.Api.Infrastructure.Payments;

public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(Guid subscriptionId, Money amount, CancellationToken cancellationToken);
}

public sealed record PaymentResult(bool Succeeded, string? GatewayReference, string? FailureReason);
